import { Hono } from 'hono'
import { and, eq, isNotNull, inArray } from 'drizzle-orm'
import { schoolClasses, followUps, children } from '@pinequest/db/d1'
import { formatChildName } from '@pinequest/core'
import { authenticate } from '../middleware/auth.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const scheduleRoutes = new Hono<AppEnv>()

// Read-only union of everything on the calendar (DB-backed, no server push):
//  • class screening visits  → SchoolClass.scheduledAt
//  • follow-up appointments   → FollowUp.appointmentAt
// The web calendar marks these days; the bell lists the upcoming ones.
scheduleRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const scope = schoolScope(c.get('jwtPayload')) // schoolId for school-bound roles, undefined for admin

  const visits = await db
    .select({ id: schoolClasses.id, date: schoolClasses.scheduledAt, name: schoolClasses.name, seasonId: schoolClasses.seasonId, schoolId: schoolClasses.schoolId })
    .from(schoolClasses)
    .where(and(isNotNull(schoolClasses.scheduledAt), scope ? eq(schoolClasses.schoolId, scope) : undefined))

  const appts = await db
    .select({ id: followUps.id, date: followUps.appointmentAt, childKey: followUps.childKey, schoolId: followUps.schoolId, notes: followUps.notes })
    .from(followUps)
    .where(and(isNotNull(followUps.appointmentAt), scope ? eq(followUps.schoolId, scope) : undefined))

  const keys = appts.map((a) => a.childKey)
  const kids = keys.length ? await db.select().from(children).where(inArray(children.childKey, keys)) : []
  const byKey = new Map(kids.map((k) => [k.childKey, formatChildName(k)]))

  const events = [
    ...visits.map((v) => ({ id: `visit-${v.id}`, kind: 'visit' as const, date: v.date, title: v.name, subtitle: v.seasonId, schoolId: v.schoolId })),
    ...appts.map((a) => ({ id: `appt-${a.id}`, kind: 'followup' as const, date: a.date, title: byKey.get(a.childKey) ?? a.childKey.slice(0, 12), subtitle: a.notes ?? null, schoolId: a.schoolId })),
  ]
    .filter((e) => e.date)
    .sort((x, y) => new Date(x.date as Date).getTime() - new Date(y.date as Date).getTime())

  return c.json({ success: true, data: events })
})
