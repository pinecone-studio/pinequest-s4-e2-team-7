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
