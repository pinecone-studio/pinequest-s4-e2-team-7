import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authenticate } from '../middleware/auth.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const seasonRoutes = new Hono<AppEnv>()

// Distinct seasons that actually exist (from screenings + classes), school-scoped.
// Newest first. No Season model — derived from the immutable event log + roster.
seasonRoutes.get('/', authenticate, async (c) => {
  const scope = schoolScope(c.get('jwtPayload'))
  const where = { schoolId: scope || undefined }
  const [fromScreenings, fromClasses] = await Promise.all([
    prisma.screening.findMany({ where, select: { seasonId: true }, distinct: ['seasonId'] }),
    prisma.schoolClass.findMany({ where, select: { seasonId: true }, distinct: ['seasonId'] }),
  ])
  const seasons = [...new Set([...fromScreenings, ...fromClasses].map((r) => r.seasonId))]
    .sort()
    .reverse()
  return c.json({ success: true, data: seasons })
})
