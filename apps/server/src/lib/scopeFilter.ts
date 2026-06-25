import { eq, or, inArray, type SQL, type AnyColumn } from 'drizzle-orm'
import { userScopes, type DB } from '@pinequest/db/d1'
import type { JwtPayload } from '../types.js'

// Legacy single-school scope (school-level routes e.g. followups).
export const schoolScope = (payload: JwtPayload): string | undefined =>
  payload.role === 'admin' ? undefined : (payload.schoolId ?? undefined)

export type ScreeningScope = { all: boolean; classIds: string[]; schoolIds: string[] }

export const resolveScope = async (db: DB, payload: JwtPayload): Promise<ScreeningScope> => {
  if (payload.role === 'admin') return { all: true, classIds: [], schoolIds: [] }
  const rows = await db
    .select({ scopeKind: userScopes.scopeKind, scopeId: userScopes.scopeId })
    .from(userScopes)
    .where(eq(userScopes.userId, payload.sub))
  const classIds = rows.filter((s) => s.scopeKind === 'class').map((s) => s.scopeId)
  const schoolIds = rows.filter((s) => s.scopeKind === 'school').map((s) => s.scopeId)
  if (payload.schoolId && !schoolIds.includes(payload.schoolId)) schoolIds.push(payload.schoolId)
  return { all: false, classIds, schoolIds }
}

// Scope condition over any table with classId + schoolId columns (Screening, Child).
// undefined = admin/no filter; deny-all when the user has no grants.
export const scopeWhere = (
  s: ScreeningScope,
  cols: { classId: AnyColumn; schoolId: AnyColumn },
): SQL | undefined => {
  if (s.all) return undefined
  const conds: SQL[] = []
  if (s.classIds.length) conds.push(inArray(cols.classId, s.classIds))
  if (s.schoolIds.length) conds.push(inArray(cols.schoolId, s.schoolIds))
  return conds.length ? or(...conds) : eq(cols.schoolId, '__no_scope__')
}
