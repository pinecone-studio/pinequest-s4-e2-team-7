import { Hono } from 'hono'
import { eq, inArray, or } from 'drizzle-orm'
import { screenings, schoolClasses } from '@pinequest/db/d1'
import { authenticate } from '../middleware/auth.js'
import { resolveScope, scopeWhere } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const seasonRoutes = new Hono<AppEnv>()

// Distinct seasons (from screenings + classes), scope-filtered, newest first.
seasonRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const scSc = scopeWhere(scope, { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey })
  // SchoolClass matches on its own id for class scope (no classId column).
  const classCond = scope.all
    ? undefined
    : (or(
        scope.classIds.length ? inArray(schoolClasses.id, scope.classIds) : undefined,
        scope.schoolIds.length ? inArray(schoolClasses.schoolId, scope.schoolIds) : undefined,
      ) ?? eq(schoolClasses.id, '__no_scope__'))

  const [fromScreenings, fromClasses] = await Promise.all([
    db.selectDistinct({ seasonId: screenings.seasonId }).from(screenings).where(scSc),
    db.selectDistinct({ seasonId: schoolClasses.seasonId }).from(schoolClasses).where(classCond),
  ])
  const seasons = [...new Set([...fromScreenings, ...fromClasses].map((r) => r.seasonId))].sort().reverse()
  return c.json({ success: true, data: seasons })
})
