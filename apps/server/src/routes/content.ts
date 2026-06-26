import { Hono } from 'hono'
import { desc, eq } from 'drizzle-orm'
import { contentVersions } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import type { AppEnv } from '../types.js'

export const contentRoutes = new Hono<AppEnv>()

contentRoutes.get('/', authenticate, async (c) => {
  const data = await c.get('db').select().from(contentVersions).orderBy(desc(contentVersions.publishedAt))
  return c.json({ success: true, data })
})

contentRoutes.post('/', authorize('admin', 'dentist'), async (c) => {
  const { version, locale, notes } = await c.req.json<{ version: string; locale?: string; notes?: string }>()
  if (!version?.trim()) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const [created] = await c.get('db').insert(contentVersions)
    .values({ version: version.trim(), locale: locale || 'mn', status: 'draft', notes: notes?.trim() || null, publishedById: c.get('jwtPayload').sub })
    .returning()
  return c.json({ success: true, data: created }, 201)
})

// Publish = the dentist-approval gate for parent/education content (audited).
contentRoutes.patch('/:id/publish', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const existing = await db.query.contentVersions.findFirst({ where: eq(contentVersions.id, id) })
  if (!existing) return c.json({ success: false, data: null }, 404)
  const [updated] = await db.update(contentVersions)
    .set({ status: 'published', publishedAt: new Date(), publishedById: c.get('jwtPayload').sub })
    .where(eq(contentVersions.id, id)).returning()
  await writeAudit(db, c.get('jwtPayload').sub, 'ContentVersion', id, 'publish', existing, updated)
  return c.json({ success: true, data: updated })
})
