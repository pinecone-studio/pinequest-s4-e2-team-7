import { Hono } from 'hono'
import { count } from 'drizzle-orm'
import { users } from '@pinequest/db/d1'
import { runSeed } from '../lib/seed.js'
import type { AppEnv } from '../types.js'

export const devRoutes = new Hono<AppEnv>()

// One-time bootstrap: seeds only when the DB has no users (safe to leave wired).
// Gated by SEED_ENABLED — absent in prod, so the route is inert (404) unless
// explicitly turned on (local dev / a controlled one-time bootstrap).
devRoutes.post('/seed', async (c) => {
  if (c.env.SEED_ENABLED !== 'true') return c.json({ success: false, message: 'not_found' }, 404)
  const db = c.get('db')
  const [row] = await db.select({ c: count() }).from(users)
  if ((row?.c ?? 0) > 0) return c.json({ success: false, message: 'already_seeded' }, 409)
  const { adminId } = await runSeed(db)
  return c.json({ success: true, data: { adminId, login: 'admin@screener.mn / admin123' } })
})
