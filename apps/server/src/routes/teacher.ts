import { Hono } from 'hono'
import { and, asc, count, desc, eq, inArray, ne } from 'drizzle-orm'
import { childKey, teacherClassCreateSchema, teacherRosterAppendSchema } from '@pinequest/core'
import { schoolClasses, children, screenings, screeningReviews, toothFindings, userScopes, users } from '@pinequest/db/d1'
import type { LongitudinalFlag, TriageLevel } from '@pinequest/types'
import { authorize } from '../middleware/auth.js'
import { inChunks } from '../lib/chunk.js'
import { hasClassScope, resolveScope } from '../lib/scopeFilter.js'
import { findPreviousChildKey, collectAncestorKeys } from '../lib/transfer.js'
import type { AppEnv } from '../types.js'

export const teacherRoutes = new Hono<AppEnv>()

// A teacher's own classes (resolved from their class scopes) with enrolled/screened counts.
teacherRoutes.get('/classes', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const order = [desc(schoolClasses.seasonId), asc(schoolClasses.name)] as const
  const classes = scope.all
    ? await db.select().from(schoolClasses).orderBy(...order)
    : scope.classIds.length
      ? await db.select().from(schoolClasses).where(inArray(schoolClasses.id, scope.classIds)).orderBy(...order)
      : []
  const classIds = classes.map((k) => k.id)

  const [enrolledGroups, screenedRows] = classIds.length
    ? await Promise.all([
        db.select({ classId: children.classId, c: count() }).from(children)
          .where(and(inArray(children.classId, classIds), eq(children.isActive, true))).groupBy(children.classId),
        db.selectDistinct({ classId: screenings.classId, childKey: screenings.childKey }).from(screenings)
          .where(inArray(screenings.classId, classIds)),
      ])
    : [[], []]

  const enrolledBy = new Map(enrolledGroups.map((g) => [g.classId, g.c]))
  const screenedBy = new Map<string, number>()
  for (const r of screenedRows) screenedBy.set(r.classId, (screenedBy.get(r.classId) ?? 0) + 1)
  const data = classes.map((k) => ({ ...k, enrolled: enrolledBy.get(k.id) ?? 0, screened: screenedBy.get(k.id) ?? 0 }))
  return c.json({ success: true, data })
})

// Create a class + its roster under the teacher's own school, then grant class scope.
teacherRoutes.post('/classes', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const body = teacherClassCreateSchema.parse(await c.req.json())

  const me = await db.query.users.findFirst({ where: eq(users.id, payload.sub), columns: { schoolId: true } })
  const schoolId = me?.schoolId ?? payload.schoolId
  if (!schoolId) return c.json({ success: false, data: null, message: 'no_school' }, 400)

  const inserted = await db.insert(schoolClasses).values({
    schoolId, name: body.name, seasonId: body.seasonId, gradeLevel: body.gradeLevel ?? null,
    expectedTotal: body.expectedTotal ?? null,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null, reminderPhone: body.reminderPhone ?? null,
  }).returning().catch(() => null)
  if (!inserted?.[0]) return c.json({ success: false, data: null, message: 'duplicate_class' }, 409)
  const klass = inserted[0]

  if (body.students.length) {
    await inChunks(body.students.map((s) => ({
      classId: klass.id, schoolId,
      childKey: childKey({ schoolId, className: body.name, rosterSlot: s.rosterSlot, birthYear: s.birthYear }),
      firstName: s.firstName, lastName: s.lastName, birthYear: s.birthYear, rosterSlot: s.rosterSlot,
      gender: s.gender ?? null, guardianPhone: s.guardianPhone ?? null, guardianEmail: s.guardianEmail ?? null,
    })), (b) => db.insert(children).values(b))
  }

  if (payload.role === 'teacher') {
    await db.insert(userScopes)
      .values({ userId: payload.sub, scopeKind: 'class', scopeId: klass.id, grantedBy: payload.sub })
      .onConflictDoNothing()
  }
  return c.json({ success: true, data: { ...klass, enrolled: body.students.length, screened: 0 } }, 201)
})

// Update a class's "total kids to evaluate" (expectedTotal) — the coverage
// denominator that drives the Хамрагдсан/Үлдсэн bars and dashboard coverage.
// Scoped to class owners. `null`/0 clears it (falls back to roster size).
teacherRoutes.patch('/classes/:classId', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }
  const { expectedTotal } = await c.req.json<{ expectedTotal?: number | null }>()
  const value = typeof expectedTotal === 'number' && expectedTotal > 0 ? Math.floor(expectedTotal) : null
  const [updated] = await db.update(schoolClasses).set({ expectedTotal: value }).where(eq(schoolClasses.id, classId)).returning()
  if (!updated) return c.json({ success: false, data: null, message: 'not_found' }, 404)
  return c.json({ success: true, data: updated })
})

// Append students to an existing class. Roster slots continue from the current max
// (counting inactive children too, so childKeys never collide). Scoped to class owners.
teacherRoutes.post('/classes/:classId/students', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const klass = await db.query.schoolClasses.findFirst({ where: eq(schoolClasses.id, classId) })
  if (!klass) return c.json({ success: false, data: null, message: 'not_found' }, 404)

  const body = teacherRosterAppendSchema.parse(await c.req.json())

  const existing = await db.select({ rosterSlot: children.rosterSlot }).from(children).where(eq(children.classId, classId))
  let slot = existing.reduce((m, r) => Math.max(m, r.rosterSlot), 0)

  // A newly added student may be a transfer-in from another class/school. Match by a
  // reliable guardian identifier so their prior screening history follows them.
  const rows = await Promise.all(body.students.map(async (s) => {
    slot += 1
    return {
      classId, schoolId: klass.schoolId,
      childKey: childKey({ schoolId: klass.schoolId, className: klass.name, rosterSlot: slot, birthYear: s.birthYear }),
      firstName: s.firstName, lastName: s.lastName, birthYear: s.birthYear, rosterSlot: slot,
      gender: s.gender ?? null, guardianPhone: s.guardianPhone ?? null, guardianEmail: s.guardianEmail ?? null,
      previousChildKey: await findPreviousChildKey(db, {
        birthYear: s.birthYear, guardianEmail: s.guardianEmail, guardianPhone: s.guardianPhone, excludeClassId: classId,
      }),
    }
  }))
  await inChunks(rows, (b) => db.insert(children).values(b))
  // Return the created rows (incl. childKey + rosterSlot) so the web screening flow
  // can immediately screen a just-added child without a roster re-fetch.
  const created = rows.map((r) => ({
    childKey: r.childKey, rosterSlot: r.rosterSlot,
    firstName: r.firstName, lastName: r.lastName, birthYear: r.birthYear,
  }))
  return c.json({ success: true, data: { added: rows.length, children: created } }, 201)
})

// Per-child status for one class: roster PII + latest triage level. Powers the class
// overview, the red-status list, and coverage ("attendance"). Scoped to class owners.
teacherRoutes.get('/classes/:classId/roster-status', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const kids = await db.select().from(children)
    .where(and(eq(children.classId, classId), eq(children.isActive, true))).orderBy(asc(children.rosterSlot))
  const keys = kids.map((k) => k.childKey)

  // Current-class screenings only — this keeps carried-forward children (same childKey,
  // new season) correctly un-screened until they're actually screened this term.
  const scr = keys.length
    ? await db.select({ childKey: screenings.childKey, triageLevel: screenings.triageLevel, capturedAt: screenings.capturedAt })
        .from(screenings).where(and(eq(screenings.classId, classId), inArray(screenings.childKey, keys)))
        .orderBy(desc(screenings.capturedAt))
    : []
  const current = new Map<string, { level: string; capturedAt: Date }>()
  for (const s of scr) if (!current.has(s.childKey)) current.set(s.childKey, { level: s.triageLevel, capturedAt: s.capturedAt })

  // Transfer-ins carry their history: walk each transferred child's lineage and pull
  // the latest screening across ANY class for those ancestor keys.
  const kidAncestors = new Map<string, string[]>()
  for (const k of kids) {
    if (k.previousChildKey) kidAncestors.set(k.id, await collectAncestorKeys(db, [k.previousChildKey]))
  }
  const ancestorKeys = [...new Set([...kidAncestors.values()].flat())]
  const hist = new Map<string, { level: string; capturedAt: Date }>()
  if (ancestorKeys.length) {
    const rows = await db.select({ childKey: screenings.childKey, triageLevel: screenings.triageLevel, capturedAt: screenings.capturedAt })
      .from(screenings).where(inArray(screenings.childKey, ancestorKeys)).orderBy(desc(screenings.capturedAt))
    for (const r of rows) if (!hist.has(r.childKey)) hist.set(r.childKey, { level: r.triageLevel, capturedAt: r.capturedAt })
  }

  const data = kids.map((k) => {
    // Best (most recent) of the current-class screening and any inherited lineage history.
    let best = current.get(k.childKey) ?? null
    for (const a of kidAncestors.get(k.id) ?? []) {
      const h = hist.get(a)
      if (h && (!best || h.capturedAt > best.capturedAt)) best = h
    }
    return {
      id: k.id, childKey: k.childKey, rosterSlot: k.rosterSlot, firstName: k.firstName, lastName: k.lastName,
      birthYear: k.birthYear, guardianEmail: k.guardianEmail, guardianPhone: k.guardianPhone,
      latestLevel: best?.level ?? null, screenedAt: best?.capturedAt ?? null,
      transferredIn: !!k.previousChildKey,
    }
  })
  return c.json({ success: true, data })
})

// Minimal prior-season summary cache for mobile offline prefetch.
// Returns NO PII: only childKey, triage level, date-only, and longitudinal finding flags.
// `excludeSeasonId` keeps incomplete current-season data out of the cache.
teacherRoutes.get('/classes/:classId/history-cache', authorize('teacher', 'admin'), async (c) => {
  const db = c.get('db')
  const classId = c.req.param('classId')
  const excludeSeasonId = c.req.query('excludeSeasonId')

  if (!(await hasClassScope(db, c.get('jwtPayload'), classId))) {
    return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }

  const kids = await db.select({ childKey: children.childKey, previousChildKey: children.previousChildKey })
    .from(children).where(and(eq(children.classId, classId), eq(children.isActive, true)))
  if (!kids.length) return c.json({ success: true, data: [] })

  // Attribute every lineage key (own + transferred-in ancestors) back to the current
  // child's childKey, so the device — which knows the child only by their current key —
  // still sees prior-season history that happened under a different class/school.
  const keyToChild = new Map<string, string>()
  for (const k of kids) {
    keyToChild.set(k.childKey, k.childKey)
    if (k.previousChildKey) {
      for (const a of await collectAncestorKeys(db, [k.previousChildKey])) keyToChild.set(a, k.childKey)
    }
  }
  const keys = [...keyToChild.keys()]

  // Prior screenings only — exclude current season if specified.
  const scrConds = [inArray(screenings.childKey, keys)]
  if (excludeSeasonId) scrConds.push(ne(screenings.seasonId, excludeSeasonId))

  const scrRows = await db.select({
    childKey: screenings.childKey,
    id: screenings.id,
    seasonId: screenings.seasonId,
    level: screenings.triageLevel,
    capturedAt: screenings.capturedAt,
    confirmed: screeningReviews.confirmedLevel,
  }).from(screenings)
    .leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
    .where(and(...scrConds))
    .orderBy(desc(screenings.capturedAt))

  // Latest screening per (current child, season) — remapping lineage keys forward.
  const seasonMap = new Map<string, (typeof scrRows)[number] & { mappedChildKey: string }>()
  for (const r of scrRows) {
    const mappedChildKey = keyToChild.get(r.childKey) ?? r.childKey
    const k = `${mappedChildKey}__${r.seasonId}`
    if (!seasonMap.has(k)) seasonMap.set(k, { ...r, mappedChildKey })
  }
  const latestPerSeason = [...seasonMap.values()]
  if (!latestPerSeason.length) return c.json({ success: true, data: [] })

  const screeningIds = latestPerSeason.map((r) => r.id)
  const allFindings = await db.select({
    screeningId: toothFindings.screeningId,
    fdi: toothFindings.fdi,
    longitudinal: toothFindings.longitudinal,
  }).from(toothFindings).where(inArray(toothFindings.screeningId, screeningIds))

  const findingsBy = new Map<string, (typeof allFindings)>()
  for (const f of allFindings) {
    const list = findingsBy.get(f.screeningId) ?? []
    list.push(f); findingsBy.set(f.screeningId, list)
  }

  const data = latestPerSeason.map((r) => ({
    childKey: r.mappedChildKey,
    seasonId: r.seasonId,
    triageLevel: (r.confirmed ?? r.level) as TriageLevel,
    // Date-only ISO string reduces fingerprinting risk
    capturedAt: r.capturedAt.toISOString().split('T')[0],
    confirmedLevel: (r.confirmed ?? null) as TriageLevel | null,
    longitudinalFlags: (findingsBy.get(r.id) ?? [])
      .filter((f) => f.fdi != null && f.longitudinal != null)
      .map((f) => ({ fdi: f.fdi as number, flag: f.longitudinal as LongitudinalFlag })),
    cachedAt: new Date().toISOString(),
  }))

  return c.json({ success: true, data })
})
