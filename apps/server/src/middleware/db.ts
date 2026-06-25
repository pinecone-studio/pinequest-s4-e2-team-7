import { createMiddleware } from 'hono/factory'
import { createDb } from '@pinequest/db/d1'
import type { AppEnv } from '../types.js'

// Per-request Drizzle client bound to the Worker's D1 binding. Sets `c.var.db`.
export const withDb = createMiddleware<AppEnv>(async (c, next) => {
  c.set('db', createDb(c.env.DB))
  await next()
})
