import { Hono } from 'hono'
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm'
import { childKey } from '@pinequest/core'
import { schoolClasses, children, screenings } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { hasClassScope } from '../lib/scopeFilter.js'
import { inChunks } from '../lib/chunk.js'
import type { AppEnv } from '../types.js'

export const classRoutes = new Hono<AppEnv>()

classRoutes.get('/schools/:schoolId/classes', authenticate, async (c) => {
  const db = c.get('db')
  const classes = await db.select().from(schoolClasses)
    .where(eq(schoolClasses.schoolId, c.req.param('schoolId')))
    .orderBy(desc(schoolClasses.seasonId), asc(schoolClasses.name))
  const classIds = classes.map((k) => k.id)

  const [enrolledGroups, screenedRows] = await Promise.all([
    db.select({ classId: children.classId, c: count() }).from(children)
      .where(and(inArray(children.classId, classIds), eq(children.isActive, true)))
      .groupBy(children.classId),
    db.selectDistinct({ classId: screenings.classId, childKey: screenings.childKey }).from(screenings)
      .where(inArray(screenings.classId, classIds)),
  ])

  const enrolledBy = new Map(enrolledGroups.map((g) => [g.classId, g.c]))
  const screenedBy = new Map<string, number>()
  for (const r of screenedRows) screenedBy.set(r.classId, (screenedBy.get(r.classId) ?? 0) + 1)

  const data = classes.map((k) => ({ ...k, enrolled: enrolledBy.get(k.id) ?? 0, screened: screenedBy.get(k.id) ?? 0 }))
  return c.json({ success: true, data })
})

classRoutes.post('/schools/:schoolId/classes', authorize('admin'), async (c) => {
  const { name, seasonId, gradeLevel } = await c.req.json<{ name: string; seasonId: string; gradeLevel?: number }>()
  const [klass] = await c.get('db').insert(schoolClasses)
    .values({ schoolId: c.req.param('schoolId'), name, seasonId, gradeLevel: gradeLevel ?? null }).returning()
  return c.json({ success: true, data: klass }, 201)
})

classRoutes.get('/classes/:classId', authenticate, async (c) => {
  const klass = await c.get('db').query.schoolClasses.findFirst({ where: eq(schoolClasses.id, c.req.param('classId')) })
  if (!klass) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: klass })
})

classRoutes.patch('/classes/:classId/schedule', authorize('teacher', 'screener', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  const payload = c.get('jwtPayload')
  // Teachers may only reschedule a class they own.
  if (payload.role === 'teacher' && !(await hasClassScope(db, payload, classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }
  const { scheduledAt, reminderPhone } = await c.req.json<{ scheduledAt?: string | null; reminderPhone?: string | null }>()
  const [updated] = await db.update(schoolClasses).set({
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    reminderPhone: reminderPhone ?? null,
  }).where(eq(schoolClasses.id, classId)).returning()
  return c.json({ success: true, data: updated })
})

classRoutes.post('/classes/:classId/carry-forward', authorize('screener', 'admin'), async (c) => {
  const db = c.get('db')
  const source = await db.query.schoolClasses.findFirst({ where: eq(schoolClasses.id, c.req.param('classId')) })
  if (!source) return c.json({ success: false, data: null }, 404)
  const { newSeasonId, newName, scheduledAt, reminderPhone } =
    await c.req.json<{ newSeasonId: string; newName?: string; scheduledAt?: string | null; reminderPhone?: string | null }>()

  const sourceChildren = await db.select().from(children)
    .where(and(eq(children.classId, source.id), eq(children.isActive, true)))

  const [created] = await db.insert(schoolClasses).values({
    schoolId: source.schoolId, name: newName ?? source.name, seasonId: newSeasonId, gradeLevel: source.gradeLevel,
    sourceClassId: source.id, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, reminderPhone: reminderPhone ?? null,
  }).returning()

  await inChunks(sourceChildren.map((ch) => ({
    classId: created.id, schoolId: source.schoolId,
    childKey: childKey({ schoolId: source.schoolId, className: created.name, rosterSlot: ch.rosterSlot, birthYear: ch.birthYear }),
    firstName: ch.firstName, lastName: ch.lastName, birthYear: ch.birthYear,
    rosterSlot: ch.rosterSlot, gender: ch.gender, guardianPhone: ch.guardianPhone,
  })), (b) => db.insert(children).values(b))
  return c.json({ success: true, data: { ...created, enrolled: sourceChildren.length, screened: 0 } }, 201)
})
