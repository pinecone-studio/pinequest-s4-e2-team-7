import type { UserRole } from '@pinequest/types'

/** One record, role-scoped views. These guards are the single source of truth. */

export const isAdmin = (role: UserRole): boolean => role === 'admin'

/** Full per-tooth chart with confidence + history. */
export const canViewFullChart = (role: UserRole): boolean =>
  role === 'dentist' || role === 'admin'

/** Confirm or override triage (audited event). */
export const canOverrideTriage = (role: UserRole): boolean => role === 'dentist'

/** Move a child through the follow-up lifecycle (audited event). */
export const canUpdateFollowUp = (role: UserRole): boolean =>
  role === 'follow_up' || role === 'admin'

/** Manage rosters, content versions, and users. */
export const canManageRoster = (role: UserRole): boolean => role === 'admin'
