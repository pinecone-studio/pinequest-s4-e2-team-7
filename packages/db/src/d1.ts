import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'
import * as schema from './schema/index.js'

// Drizzle client bound to a Cloudflare D1 database. Created per-request from the
// Worker's `env.DB` binding (no global singleton — D1 lives in the request env).
export const createDb = (d1: D1Database) => drizzle(d1, { schema })
export type DB = ReturnType<typeof createDb>

export * from './schema/index.js'
export { schema }
