import { and, eq } from 'drizzle-orm'
import { seasonForDate } from '@pinequest/core'
import { schoolClasses, userScopes, type DB } from '@pinequest/db/d1'

/**
 * On teacher signup: create the teacher's class for the CURRENT season with a
 * planned size (expectedTotal = "total kids to evaluate"), then grant class scope.
 * Idempotent — reuses an existing class with the same (school, name, season).
 * Best-effort: returns the class id, or null if it couldn't be created.
 */
export const ensureTeacherClass = async (
  db: DB,
  opts: { userId: string; schoolId: string; className: string; expectedTotal: number | null },
): Promise<string | null> => {
  const name = opts.className.trim()
  if (!name) return null
  const seasonId = seasonForDate(new Date())
  const existing = await db.query.schoolClasses.findFirst({
    where: and(eq(schoolClasses.schoolId, opts.schoolId), eq(schoolClasses.name, name), eq(schoolClasses.seasonId, seasonId)),
    columns: { id: true },
  })
  const classId =
    existing?.id ??
    (await db.insert(schoolClasses).values({ schoolId: opts.schoolId, name, seasonId, expectedTotal: opts.expectedTotal }).returning())[0]?.id
  if (!classId) return null
  await db.insert(userScopes)
    .values({ userId: opts.userId, scopeKind: 'class', scopeId: classId, grantedBy: opts.userId })
    .onConflictDoNothing()
  return classId
}
