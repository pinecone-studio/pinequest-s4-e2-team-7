import { Hono } from 'hono'
import { runSeed } from '../lib/seed.js'
import type { AppEnv } from '../types.js'

export const devRoutes = new Hono<AppEnv>()

// Seed bootstrap + demo data. Idempotent (onConflictDoNothing), so re-running
// is safe and tops up demo rows. Gated by SEED_ENABLED — absent in prod, so the
// route is inert (404) unless explicitly turned on (local dev).
devRoutes.post('/seed', async (c) => {
  if (c.env.SEED_ENABLED !== 'true') return c.json({ success: false, message: 'not_found' }, 404)
  const { adminId } = await runSeed(c.get('db'))
  return c.json({ success: true, data: { adminId, login: 'admin@screener.mn / admin123' } })
})
