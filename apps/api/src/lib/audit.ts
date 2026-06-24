import type { FastifyInstance } from 'fastify'

/**
 * Append an audit entry. Dentist overrides and follow-up status changes are
 * audited events, never silent edits.
 */
export const writeAudit = async (
  app: FastifyInstance,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> => {
  await app.prisma.auditLog.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
    },
  })
}
