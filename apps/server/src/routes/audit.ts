import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'
import { auditLogs } from '@pinequest/db/d1'
import { authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const auditRoutes = new Hono<AppEnv>()

auditRoutes.get('/', authorize('admin', 'dentist'), async (c) => {
  const { entityType, entityId, userId, limit } = c.req.query()
  const conds = [
    entityType ? eq(auditLogs.entityType, entityType) : undefined,
    entityId ? eq(auditLogs.entityId, entityId) : undefined,
    userId ? eq(auditLogs.userId, userId) : undefined,
  ].filter(Boolean)
  const logs = await c.get('db').query.auditLogs.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: desc(auditLogs.createdAt),
    limit: Math.min(Number(limit) || 50, 200),
    with: { user: { columns: { id: true, name: true, role: true } } },
  })
  return c.json({ success: true, data: logs })
})
