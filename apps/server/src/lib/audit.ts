import { auditLogs, type DB } from '@pinequest/db/d1'

export const writeAudit = async (
  db: DB,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  oldValue: unknown,
  newValue: unknown,
): Promise<void> => {
  await db.insert(auditLogs).values({
    userId,
    entityType,
    entityId,
    action,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
  })
}
