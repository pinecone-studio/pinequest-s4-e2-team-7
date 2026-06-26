import { eq, or, inArray, type SQL, type AnyColumn } from 'drizzle-orm'
import { userScopes, schoolClasses, parentChildLinks, type DB } from '@pinequest/db/d1'
import type { JwtPayload } from '../types.js'

// Legacy single-school scope (school-level routes e.g. followups).
export const schoolScope = (payload: JwtPayload): string | undefined =>
  payload.role === 'admin' ? undefined : (payload.schoolId ?? undefined)

export type ScreeningScope = { all: boolean; classIds: string[]; schoolIds: string[]; childKeys: string[] }

export const resolveScope = async (db: DB, payload: JwtPayload): Promise<ScreeningScope> => {
  if (payload.role === 'admin') return { all: true, classIds: [], schoolIds: [], childKeys: [] }

  // Parent: strictly child-scoped via ParentChildLink — no class/school widening.
  if (payload.role === 'parent') {
    const links = await db
      .select({ childKey: parentChildLinks.childKey })
      .from(parentChildLinks)
      .where(eq(parentChildLinks.userId, payload.sub))
    return { all: false, classIds: [], schoolIds: [], childKeys: links.map((l) => l.childKey) }
  }

  const rows = await db
    .select({ scopeKind: userScopes.scopeKind, scopeId: userScopes.scopeId })
    .from(userScopes)
    .where(eq(userScopes.userId, payload.sub))
  const classIds = rows.filter((s) => s.scopeKind === 'class').map((s) => s.scopeId)
  const schoolIds = rows.filter((s) => s.scopeKind === 'school').map((s) => s.scopeId)
  // Teachers carry a schoolId only to author rosters; their VIEW stays class-scoped.
  // School doctors DO get school-level scope from their schoolId (the auto-add below).
  if (payload.schoolId && payload.role !== 'teacher' && !schoolIds.includes(payload.schoolId)) schoolIds.push(payload.schoolId)
  return { all: false, classIds, schoolIds, childKeys: [] }
}

/** Does this user's scope cover a specific child? Gates per-child edit/delete/status. */
export const hasChildAccess = async (
  db: DB,
  payload: JwtPayload,
  child: { classId: string; schoolId: string; childKey: string },
): Promise<boolean> => {
  if (payload.role === 'admin') return true
  const scope = await resolveScope(db, payload)
  return scope.all
    || scope.childKeys.includes(child.childKey)
    || scope.classIds.includes(child.classId)
    || scope.schoolIds.includes(child.schoolId)
}

/** Does this user's scope cover a specific class? Used to gate per-class teacher routes. */
export const hasClassScope = async (db: DB, payload: JwtPayload, classId: string): Promise<boolean> => {
  if (payload.role === 'admin') return true
  const scope = await resolveScope(db, payload)
  if (scope.classIds.includes(classId)) return true
  if (scope.schoolIds.length) {
    const klass = await db.query.schoolClasses.findFirst({
      where: eq(schoolClasses.id, classId),
      columns: { schoolId: true },
    })
    return !!klass && scope.schoolIds.includes(klass.schoolId)
  }
  return false
}

// Scope condition over any table with classId + schoolId columns (Screening, Child).
// undefined = admin/no filter; deny-all when the user has no grants.
export const scopeWhere = (
  s: ScreeningScope,
  cols: { classId: AnyColumn; schoolId: AnyColumn; childKey?: AnyColumn },
): SQL | undefined => {
  if (s.all) return undefined
  const conds: SQL[] = []
  if (s.classIds.length) conds.push(inArray(cols.classId, s.classIds))
  if (s.schoolIds.length) conds.push(inArray(cols.schoolId, s.schoolIds))
  if (cols.childKey && s.childKeys.length) conds.push(inArray(cols.childKey, s.childKeys))
  return conds.length ? or(...conds) : eq(cols.schoolId, '__no_scope__')
}
