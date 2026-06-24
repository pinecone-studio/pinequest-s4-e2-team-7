import type { FollowUpStatus } from './common'
import type { ChildKey } from './child'

/**
 * The ONLY mutable record. Belongs to a child across screenings.
 * Syncs two-way; last-write-wins by `updatedAt` + actor, guarded by `version`.
 */
export interface FollowUp {
  id: string
  childKey: ChildKey
  schoolId: string
  status: FollowUpStatus
  assignedToId?: string
  appointmentAt?: string
  notifiedAt?: string
  notificationChannel?: 'sms' | 'call' | 'in_person'
  notes?: string
  updatedAt: string
  updatedById: string
  /** Optimistic-lock counter; the server rejects a stale update. */
  version: number
}

/** Mutation payload; `version` is the value the client last observed. */
export type FollowUpUpdate = Pick<FollowUp, 'status' | 'version'> &
  Partial<
    Pick<
      FollowUp,
      'assignedToId' | 'appointmentAt' | 'notifiedAt' | 'notificationChannel' | 'notes'
    >
  >
