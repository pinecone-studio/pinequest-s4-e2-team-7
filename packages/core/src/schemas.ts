import { z } from 'zod'

/**
 * Zod schemas for the runtime trust boundaries (untrusted input from devices /
 * bulk imports). Internal shapes stay as plain types in @pinequest/types; only
 * what crosses a boundary gets validated here.
 */

export const rosterImportRowSchema = z.object({
  rosterSlot: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthYear: z
    .number()
    .int()
    .gte(2000)
    .lte(new Date().getFullYear()),
  gender: z.enum(['M', 'F']).optional(),
  guardianPhone: z.string().min(6).optional(),
})
export type RosterImportRowInput = z.infer<typeof rosterImportRowSchema>

export const followUpStatusSchema = z.enum([
  'flagged',
  'contacted',
  'referred',
  'treatment_completed',
  'verified_resolved',
  'lost_to_follow_up',
])

export const followUpUpdateSchema = z.object({
  status: followUpStatusSchema,
  /** The version the client last observed (optimistic lock). */
  version: z.number().int().nonnegative(),
  assignedToId: z.string().optional(),
  appointmentAt: z.string().optional(),
  notifiedAt: z.string().optional(),
  notificationChannel: z.enum(['sms', 'call', 'in_person']).optional(),
  notes: z.string().optional(),
})
export type FollowUpUpdateInput = z.infer<typeof followUpUpdateSchema>

const boundingBoxSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
})

const findingClassSchema = z.enum(['caries', 'cavity', 'crack'])

export const toothFindingSchema = z.object({
  id: z.string(),
  fdi: z.number().int().optional(),
  className: findingClassSchema,
  classId: z.number().int(),
  confidence: z.number().min(0).max(1),
  box: boundingBoxSchema,
  longitudinal: z.enum(['new', 'worsened', 'stable', 'resolved']).optional(),
})

export const symptomSetSchema = z.object({
  swelling: z.boolean().optional(),
  painDisturbingSleepOrEating: z.boolean().optional(),
  fever: z.boolean().optional(),
  gumPimpleOrFistula: z.boolean().optional(),
  trauma: z.boolean().optional(),
})

/** Validates the device's screening-create payload (the trust boundary). */
export const screeningCreateSchema = z.object({
  id: z.string(),
  childKey: z.string(),
  classId: z.string(),
  schoolId: z.string(),
  seasonId: z.string(),
  screenedById: z.string(),
  imageRefs: z.array(z.string()),
  findings: z.array(toothFindingSchema),
  symptoms: symptomSetSchema,
  triage: z.object({
    level: z.enum(['green', 'yellow', 'red']),
    score: z.number(),
    confidentWording: z.boolean(),
    reason: z.string().optional(),
  }),
  modelName: z.string(),
  modelVersion: z.string().optional(),
  contentVersionId: z.string(),
  capturedAt: z.string(),
  deviceId: z.string().optional(),
})
export type ScreeningCreateInput = z.infer<typeof screeningCreateSchema>
