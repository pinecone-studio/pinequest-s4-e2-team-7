import { Hono } from 'hono'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { followUpUpdateSchema } from '@pinequest/core'
import { followUps, children } from '@pinequest/db/d1'
import { authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const followUpRoutes = new Hono<AppEnv>()

followUpRoutes.get('/', authorize('follow_up', 'dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { status, schoolId } = c.req.query()
  const scope = schoolScope(c.get('jwtPayload'))
  const schoolFilter = scope ?? (schoolId || undefined)
  const conds = [
    status ? eq(followUps.status, status) : undefined,
    schoolFilter ? eq(followUps.schoolId, schoolFilter) : undefined,
  ].filter(Boolean)
  const list = await db.select().from(followUps)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(followUps.updatedAt))

  const kids = list.length
    ? await db.select().from(children).where(inArray(children.childKey, list.map((f) => f.childKey)))
    : []
  const byKey = new Map(kids.map((ch) => [ch.childKey, ch]))
  const data = list.map((f) => {
    const ch = byKey.get(f.childKey)
    return { ...f, childName: ch ? `${ch.lastName} ${ch.firstName}` : null, guardianPhone: ch?.guardianPhone ?? null }
  })
  return c.json({ success: true, data })
})

followUpRoutes.patch('/:childKey', authorize('follow_up', 'admin'), async (c) => {
  const db = c.get('db')
  const update = followUpUpdateSchema.parse(await c.req.json())
  const ck = c.req.param('childKey')
  const existing = await db.query.followUps.findFirst({ where: eq(followUps.childKey, ck) })

  if (existing && existing.version !== update.version) {
    return c.json({ success: false, data: existing, message: 'version_conflict' }, 409)
  }

  const fields = {
    status: update.status,
    assignedToId: update.assignedToId ?? null,
    appointmentAt: update.appointmentAt ? new Date(update.appointmentAt) : null,
    notifiedAt: update.notifiedAt ? new Date(update.notifiedAt) : null,
    notificationChannel: update.notificationChannel ?? null,
    notes: update.notes ?? null,
    updatedById: c.get('jwtPayload').sub,
  }

  let saved
  if (existing) {
    [saved] = await db.update(followUps).set({ ...fields, version: existing.version + 1 }).where(eq(followUps.childKey, ck)).returning()
  } else {
    const child = await db.query.children.findFirst({ where: eq(children.childKey, ck) })
    if (!child) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)
    ;[saved] = await db.insert(followUps).values({ childKey: ck, schoolId: child.schoolId, ...fields, version: 1 }).returning()
  }

  await writeAudit(db, c.get('jwtPayload').sub, 'FollowUp', saved.id, existing ? 'update' : 'create', existing, saved)
  return c.json({ success: true, data: saved })
})

followUpRoutes.post('/:childKey/notify', authorize('follow_up', 'admin'), async (c) => {
  const db = c.get('db')
  const { channel, note } = await c.req.json<{ channel: string; note?: string }>()
  const ck = c.req.param('childKey')
  const existing = await db.query.followUps.findFirst({ where: eq(followUps.childKey, ck) })
  if (!existing) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)

  const [updated] = await db.update(followUps).set({
    notifiedAt: new Date(),
    notificationChannel: channel,
    notes: note ?? existing.notes,
    status: existing.status === 'flagged' ? 'contacted' : existing.status,
    updatedById: c.get('jwtPayload').sub,
    version: existing.version + 1,
  }).where(eq(followUps.childKey, ck)).returning()
  await writeAudit(db, c.get('jwtPayload').sub, 'FollowUp', updated.id, 'notify', existing, updated)
  return c.json({ success: true, data: updated })
})
