import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authenticate } from '../middleware/auth.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const statsRoutes = new Hono<AppEnv>()

// --- Screened-vs-Flagged time-series (D/W/M/Y) ------------------------------
// Bucketed in TS (not SQL) so the same code runs on SQLite (dev) + Postgres.
type Range = 'D' | 'W' | 'M' | 'Y'
const SLOTS: Record<Range, number> = { D: 14, W: 8, M: 6, Y: 5 }

const bucketStart = (date: Date, r: Range): Date => {
  const x = new Date(date)
  x.setHours(0, 0, 0, 0)
  if (r === 'W') x.setDate(x.getDate() - ((x.getDay() + 6) % 7)) // Monday
  else if (r === 'M') x.setDate(1)
  else if (r === 'Y') x.setMonth(0, 1)
  return x
}
const stepBack = (date: Date, r: Range, k: number): Date => {
  const x = new Date(date)
  if (r === 'D') x.setDate(x.getDate() - k)
  else if (r === 'W') x.setDate(x.getDate() - 7 * k)
  else if (r === 'M') x.setMonth(x.getMonth() - k)
  else x.setFullYear(x.getFullYear() - k)
  return x
}
const bucketize = (rows: { capturedAt: Date; triageLevel: string }[], r: Range) => {
  const n = SLOTS[r]
  const now = bucketStart(new Date(), r)
  const slots = Array.from({ length: n }, (_, i) => bucketStart(stepBack(now, r, n - 1 - i), r))
  const idx = new Map(slots.map((s, i) => [s.getTime(), i]))
  const buckets = slots.map((s) => ({ ts: s.toISOString(), screened: 0, flagged: 0 }))
  for (const row of rows) {
    const i = idx.get(bucketStart(new Date(row.capturedAt), r).getTime())
    if (i === undefined) continue
    buckets[i].screened += 1
    if (row.triageLevel === 'yellow' || row.triageLevel === 'red') buckets[i].flagged += 1
  }
  return buckets
}

statsRoutes.get('/timeseries', authenticate, async (c) => {
  const { range, seasonId, schoolId: querySchoolId } = c.req.query()
  const r: Range = (['D', 'W', 'M', 'Y'] as const).includes(range as Range) ? (range as Range) : 'M'
  const scopeSchoolId = schoolScope(c.get('jwtPayload')) ?? (querySchoolId || undefined)
  const rows = await prisma.screening.findMany({
    where: { schoolId: scopeSchoolId || undefined, seasonId: seasonId || undefined },
    select: { capturedAt: true, triageLevel: true },
  })
  return c.json({ success: true, data: { range: r, buckets: bucketize(rows, r) } })
})

statsRoutes.get('/', authenticate, async (c) => {
  const { seasonId, schoolId: querySchoolId } = c.req.query()
  const payload = c.get('jwtPayload')
  const scopeSchoolId = schoolScope(payload) ?? (querySchoolId || undefined)

  const where = {
    schoolId: scopeSchoolId || undefined,
    seasonId: seasonId || undefined,
  }

  const [triajeGroups, totalChildren, pendingReview, flagged, resolved] = await Promise.all([
    prisma.screening.groupBy({
      by: ['triageLevel'],
      where,
      _count: { id: true },
    }),
    prisma.child.count({ where: { schoolId: scopeSchoolId || undefined, isActive: true } }),
    prisma.screening.count({
      where: { ...where, review: null },
    }),
    prisma.followUp.count({ where: { schoolId: scopeSchoolId || undefined, status: 'flagged' } }),
    prisma.followUp.count({ where: { schoolId: scopeSchoolId || undefined, status: { not: 'flagged' } } }),
  ])

  const byLevel = Object.fromEntries(triajeGroups.map((g) => [g.triageLevel, g._count.id]))
  const totalScreened = (byLevel.green ?? 0) + (byLevel.yellow ?? 0) + (byLevel.red ?? 0)

  return c.json({
    success: true,
    data: {
      totalScreened,
      triage: { green: byLevel.green ?? 0, yellow: byLevel.yellow ?? 0, red: byLevel.red ?? 0 },
      coverage: { screened: totalScreened, total: totalChildren },
      pendingReview,
      flaggedFollowUps: flagged,
      resolvedFollowUps: resolved,
    },
  })
})
