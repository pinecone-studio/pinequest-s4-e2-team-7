import { Hono } from 'hono'
import { and, desc, eq, inArray, or, type SQL } from 'drizzle-orm'
import { volunteerDentists, helpRequests, children } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { resolveScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const helpRoutes = new Hono<AppEnv>()

// --- Volunteer dentist profile (a dentist marks themselves available) -------
helpRoutes.get('/volunteer', authorize('dentist', 'admin'), async (c) => {
  const row = await c.get('db').query.volunteerDentists.findFirst({
    where: eq(volunteerDentists.userId, c.get('jwtPayload').sub),
  })
  return c.json({ success: true, data: row ?? null })
})

helpRoutes.post('/volunteer', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const userId = c.get('jwtPayload').sub
  const { displayName, org, area, isAvailable } =
    await c.req.json<{ displayName: string; org?: string; area?: string; isAvailable?: boolean }>()
  if (!displayName?.trim()) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const set = { displayName: displayName.trim(), org: org?.trim() || null, area: area?.trim() || null, isAvailable: isAvailable ?? true }
  const [row] = await db.insert(volunteerDentists).values({ userId, ...set })
    .onConflictDoUpdate({ target: volunteerDentists.userId, set })
    .returning()
  return c.json({ success: true, data: row })
})

// Available volunteers (so a family/teacher can see who can help).
helpRoutes.get('/volunteers', authenticate, async (c) => {
  const rows = await c.get('db')
    .select({ id: volunteerDentists.id, displayName: volunteerDentists.displayName, org: volunteerDentists.org, area: volunteerDentists.area })
    .from(volunteerDentists).where(eq(volunteerDentists.isAvailable, true))
  return c.json({ success: true, data: rows })
})

// --- Help requests (a flagged child's family/teacher asks for a volunteer) ---
helpRoutes.post('/requests', authorize('parent', 'teacher', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const { childKey: ck, level, note } = await c.req.json<{ childKey: string; level: string; note?: string }>()
  if (!ck || (level !== 'red' && level !== 'yellow')) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)

  const child = await db.query.children.findFirst({ where: eq(children.childKey, ck) })
  if (!child) return c.json({ success: false, data: null, message: 'child_not_found' }, 404)

  // The requester must actually have scope over this child.
  const scope = await resolveScope(db, payload)
  const ok = scope.all || scope.childKeys.includes(ck) || scope.classIds.includes(child.classId) || scope.schoolIds.includes(child.schoolId)
  if (!ok) return c.json({ success: false, data: null, message: 'forbidden' }, 403)

  // One open request per child — return the existing one rather than duplicating.
  const existing = await db.query.helpRequests.findFirst({ where: and(eq(helpRequests.childKey, ck), eq(helpRequests.status, 'open')) })
  if (existing) return c.json({ success: true, data: existing })

  const [row] = await db.insert(helpRequests)
    .values({ childKey: ck, schoolId: child.schoolId, level, requestedById: payload.sub, note: note?.trim() || null })
    .returning()
  return c.json({ success: true, data: row }, 201)
})

helpRoutes.get('/requests', authenticate, async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')

  let where: SQL | undefined
  if (payload.role === 'admin') where = undefined
  else if (payload.role === 'dentist') {
    const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, payload.sub) })
    where = or(eq(helpRequests.status, 'open'), vol ? eq(helpRequests.dentistId, vol.id) : undefined)
  } else if (payload.role === 'school_doctor') {
    const scope = await resolveScope(db, payload)
    where = scope.schoolIds.length ? inArray(helpRequests.schoolId, scope.schoolIds) : eq(helpRequests.schoolId, '__none__')
  } else {
    where = eq(helpRequests.requestedById, payload.sub) // parent / teacher see their own
  }

  const reqs = await db.select().from(helpRequests).where(where).orderBy(desc(helpRequests.createdAt))
  const cks = [...new Set(reqs.map((r) => r.childKey))]
  const dids = [...new Set(reqs.map((r) => r.dentistId).filter((x): x is string => !!x))]

  const [kids, vols] = await Promise.all([
    cks.length ? db.select({ childKey: children.childKey, firstName: children.firstName, lastName: children.lastName, guardianPhone: children.guardianPhone, guardianEmail: children.guardianEmail })
      .from(children).where(inArray(children.childKey, cks)) : Promise.resolve([]),
    dids.length ? db.select({ id: volunteerDentists.id, displayName: volunteerDentists.displayName, org: volunteerDentists.org })
      .from(volunteerDentists).where(inArray(volunteerDentists.id, dids)) : Promise.resolve([]),
  ])
  const childBy = new Map(kids.map((k) => [k.childKey, k]))
  const volBy = new Map(vols.map((v) => [v.id, v]))

  const data = reqs.map((r) => ({ ...r, child: childBy.get(r.childKey) ?? null, dentist: r.dentistId ? volBy.get(r.dentistId) ?? null : null }))
  return c.json({ success: true, data })
})

// A volunteer dentist connects to an open request (who-connected-who).
helpRoutes.post('/requests/:id/connect', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, c.get('jwtPayload').sub) })
  if (!vol) return c.json({ success: false, data: null, message: 'not_a_volunteer' }, 400)
  const [row] = await db.update(helpRequests)
    .set({ dentistId: vol.id, status: 'connected', connectedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(helpRequests.id, c.req.param('id')), eq(helpRequests.status, 'open')))
    .returning()
  if (!row) return c.json({ success: false, data: null, message: 'not_open' }, 409)
  return c.json({ success: true, data: row })
})
