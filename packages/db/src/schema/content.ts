import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

const uuid = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

// Dentist-approved, versioned parent/education content. Apps pin a version.
export const contentVersions = sqliteTable('ContentVersion', {
  id: uuid(),
  version: text('version').notNull(),
  locale: text('locale').notNull(),
  publishedAt: ts('publishedAt').notNull().$defaultFn(() => new Date()),
  publishedById: text('publishedById').notNull(),
})

export const auditLogs = sqliteTable('AuditLog', {
  id: uuid(),
  userId: text('userId').notNull(),
  entityType: text('entityType').notNull(),
  entityId: text('entityId').notNull(),
  action: text('action').notNull(),
  oldValue: text('oldValue'), // JSON string
  newValue: text('newValue'), // JSON string
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  index('AuditLog_userId_idx').on(t.userId),
  index('AuditLog_entity_idx').on(t.entityType, t.entityId),
])
