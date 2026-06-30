import { Hono } from 'hono'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { screeningCreateSchema, triage } from '@pinequest/core'
import { screenings, screeningReviews, children, schoolClasses } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { persistScreening } from '../lib/persistScreening.js'
import { putBase64Images } from '../lib/r2Images.js'
import { hasChildAccess, resolveScope, scopeWhere } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const screeningRoutes = new Hono<AppEnv>()

screeningRoutes.post('/', authenticate, async (c) => {
  const db = c.get('db')
  const body = screeningCreateSchema.parse(await c.req.json())
  // A device may only submit screenings for classes/schools within its scope.
  if (!(await hasChildAccess(db, c.get('jwtPayload'), body))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  // Upload captured image bytes (base64) to R2; the DB keeps only the object keys.
  const imageRefs = body.imageData?.length
    ? await putBase64Images(c.env.IMAGES, body.id, body.imageData)
    : body.imageRefs
  const result = triage(body.findings, body.symptoms)
  // Map only the fields persistScreening owns (avoid leaking triage/screenedById/etc.).
  const screening = await persistScreening(
    db,
    {
      id: body.id, childKey: body.childKey, classId: body.classId, schoolId: body.schoolId,
      seasonId: body.seasonId, imageRefs, findings: body.findings, symptoms: body.symptoms,
      rawAnswers: body.rawAnswers,
      summary: body.summary, modelName: body.modelName, modelVersion: body.modelVersion,
      capturedAt: body.capturedAt, deviceId: body.deviceId,
    },
    result,
    c.get('jwtPayload').sub,
  )
  return c.json({ success: true, data: screening }, 201)
})

// Serve a screening's captured photo from R2 — auth-scoped (minors' images stay private).
screeningRoutes.get('/:id/image/:order', authenticate, async (c) => {
  const db = c.get('db')
  const screening = await db.query.screenings.findFirst({
    where: eq(screenings.id, c.req.param('id')),
    with: { images: true },
  })
  if (!screening) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), screening))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const order = Number(c.req.param('order'))
  const img = screening.images.find((im) => im.order === order) ?? screening.images[0]
  if (!img) return c.json({ success: false, data: null, message: 'no_image' }, 404)
  const obj = await c.env.IMAGES.get(img.ref)
  if (!obj) return c.json({ success: false, data: null, message: 'image_not_found' }, 404)
  return c.body(await obj.arrayBuffer(), 200, {
    'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
    'Cache-Control': 'private, max-age=86400',
  })
})

screeningRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const { childKey, classId, schoolId, seasonId, screenedById } = c.req.query()
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const conds = [
    scopeWhere(scope, { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey }),
    childKey ? eq(screenings.childKey, childKey) : undefined,
    classId ? eq(screenings.classId, classId) : undefined,
    schoolId ? eq(screenings.schoolId, schoolId) : undefined,
    seasonId ? eq(screenings.seasonId, seasonId) : undefined,
    screenedById ? eq(screenings.screenedById, screenedById) : undefined,
  ].filter(Boolean)
  const data = await db.query.screenings.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: desc(screenings.capturedAt),
    with: { findings: true, review: { columns: { confirmedLevel: true } } },
  })

  // Resolve roster names for display. PII stays in the roster, but the requester
  // is already scope-limited to their own classes/school, so attaching names here
  // is consistent with the board's roster-status view. Non-roster keys (parent /
  // direct screenings) simply resolve to null.
  const keys = [...new Set(data.map((s) => s.childKey))]
  const kids = keys.length
    ? await db.select({ childKey: children.childKey, classId: children.classId, firstName: children.firstName, lastName: children.lastName })
        .from(children).where(inArray(children.childKey, keys))
    : []
  const nameByKey = new Map(kids.map((k) => [`${k.classId}::${k.childKey}`, `${k.lastName} ${k.firstName}`.trim()]))
  const withNames = data.map((s) => ({ ...s, childName: nameByKey.get(`${s.classId}::${s.childKey}`) ?? null }))

  return c.json({ success: true, data: withNames })
})

screeningRoutes.get('/:id', authenticate, async (c) => {
  const db = c.get('db')
  const screening = await db.query.screenings.findFirst({
    where: eq(screenings.id, c.req.param('id')),
    with: { findings: true, images: true, questionnaire: true, review: true, summary: true },
  })
  if (!screening) return c.json({ success: false, data: null }, 404)
  if (!(await hasChildAccess(db, c.get('jwtPayload'), screening))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  const kid = await db.query.children.findFirst({
    where: and(eq(children.classId, screening.classId), eq(children.childKey, screening.childKey)),
    columns: { firstName: true, lastName: true, birthYear: true },
  })
  const childName = kid ? `${kid.lastName} ${kid.firstName}`.trim() : null
  const klass = await db.query.schoolClasses.findFirst({
    where: eq(schoolClasses.id, screening.classId),
    columns: { name: true },
  })
  return c.json({
    success: true,
    data: { ...screening, childName, childBirthYear: kid?.birthYear ?? null, className: klass?.name ?? null },
  })
})

screeningRoutes.put('/:id/review', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { confirmedLevel, note } = await c.req.json<{ confirmedLevel: string; note?: string }>()
  if (!['green', 'yellow', 'red'].includes(confirmedLevel)) {
    return c.json({ success: false, data: null, message: 'invalid_level' }, 400)
  }
  const id = c.req.param('id')
  const screening = await db.query.screenings.findFirst({ where: eq(screenings.id, id) })
  if (!screening) return c.json({ success: false, data: null }, 404)

  const existing = await db.query.screeningReviews.findFirst({ where: eq(screeningReviews.screeningId, id) })
  const reviewedById = c.get('jwtPayload').sub
  const [review] = await db.insert(screeningReviews)
    .values({ screeningId: id, confirmedLevel, note: note ?? null, reviewedById })
    .onConflictDoUpdate({ target: screeningReviews.screeningId, set: { confirmedLevel, note: note ?? null, reviewedById } })
    .returning()
  await writeAudit(db, reviewedById, 'ScreeningReview', review.id, existing ? 'override_update' : 'review', existing, review)
  return c.json({ success: true, data: review })
})
