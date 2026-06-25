import { Hono } from 'hono'
import { eq, asc } from 'drizzle-orm'
import { schools } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const schoolRoutes = new Hono<AppEnv>()

schoolRoutes.get('/', authenticate, async (c) => {
  const data = await c.get('db').select().from(schools).where(eq(schools.isActive, true)).orderBy(asc(schools.name))
  return c.json({ success: true, data })
})

schoolRoutes.post('/', authorize('admin'), async (c) => {
  const { name, soumCode, district } = await c.req.json<{ name: string; soumCode?: string; district?: string }>()
  const [school] = await c.get('db').insert(schools).values({ name, soumCode: soumCode ?? null, district: district ?? null }).returning()
  return c.json({ success: true, data: school }, 201)
})

schoolRoutes.get('/:schoolId', authenticate, async (c) => {
  const school = await c.get('db').query.schools.findFirst({ where: eq(schools.id, c.req.param('schoolId')) })
  if (!school) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: school })
})

schoolRoutes.patch('/:schoolId', authorize('admin'), async (c) => {
  const { name, soumCode, district, isActive } =
    await c.req.json<{ name?: string; soumCode?: string; district?: string; isActive?: boolean }>()
  const [school] = await c.get('db').update(schools)
    .set({ name, soumCode, district, isActive })
    .where(eq(schools.id, c.req.param('schoolId')))
    .returning()
  return c.json({ success: true, data: school })
})
