import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

export const schools = sqliteTable('School', {
  id: id(),
  name: text('name').notNull(),
  soumCode: text('soumCode'),
  district: text('district'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
})

export const schoolClasses = sqliteTable('SchoolClass', {
  id: id(),
  schoolId: text('schoolId').notNull(),
  name: text('name').notNull(),
  seasonId: text('seasonId').notNull(),
  gradeLevel: integer('gradeLevel'),
  /** Planned class size set at creation — denominator for screened-vs-remaining coverage. */
  expectedTotal: integer('expectedTotal'),
  sourceClassId: text('sourceClassId'),
  scheduledAt: ts('scheduledAt'),
  reminderPhone: text('reminderPhone'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex('SchoolClass_school_name_season_key').on(t.schoolId, t.name, t.seasonId),
  index('SchoolClass_schoolId_idx').on(t.schoolId),
])

export const children = sqliteTable('Child', {
  id: id(),
  classId: text('classId').notNull(),
  schoolId: text('schoolId').notNull(),
  childKey: text('childKey').notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  birthYear: integer('birthYear').notNull(),
  rosterSlot: integer('rosterSlot').notNull(),
  gender: text('gender'),
  guardianPhone: text('guardianPhone'),
  guardianEmail: text('guardianEmail'),
  /**
   * When this child is the same person as a prior record in another class/school
   * (a transfer-in, matched by guardian contact + birth year), this links to that
   * record's childKey so their screening history follows them. Chains across
   * multiple transfers. childKey itself is unchanged (Fixed Decision #2).
   */
  previousChildKey: text('previousChildKey'),
  /** Set when a child is marked transferred-out during carry-forward: the record is
   *  kept (history preserved) but is NOT copied into the next season. */
  transferredAt: ts('transferredAt'),
  consentObtained: integer('consentObtained', { mode: 'boolean' }).notNull().default(false),
  consentAt: ts('consentAt'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex('Child_class_slot_key').on(t.classId, t.rosterSlot),
  uniqueIndex('Child_class_childKey_key').on(t.classId, t.childKey),
  index('Child_childKey_idx').on(t.childKey),
  index('Child_schoolId_idx').on(t.schoolId),
  index('Child_previousChildKey_idx').on(t.previousChildKey),
])
