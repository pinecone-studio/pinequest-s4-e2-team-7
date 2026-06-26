import type { UserRole } from '@pinequest/types'

/** One record, role-scoped views. These guards are the single source of truth. */

export const isAdmin = (role: UserRole): boolean => role === 'admin'

/** Class teacher — owns their own roster + screening schedule, class-scoped. */
export const isTeacher = (role: UserRole): boolean => role === 'teacher'

/** Parent — sees only their own child (child-scoped via ParentChildLink). */
export const isParent = (role: UserRole): boolean => role === 'parent'

/** School doctor — oversees a whole school (all classes + teachers). */
export const isSchoolDoctor = (role: UserRole): boolean => role === 'school_doctor'

/** Create/own a class roster and set its screening schedule. */
export const canManageOwnClass = (role: UserRole): boolean =>
  role === 'teacher' || role === 'admin'

/** Full per-tooth chart with confidence + history. */
export const canViewFullChart = (role: UserRole): boolean =>
  role === 'dentist' || role === 'admin' || role === 'school_doctor'

/** Confirm or override triage (audited event) — clinical only. */
export const canOverrideTriage = (role: UserRole): boolean => role === 'dentist'

/** Move a child through the follow-up lifecycle (audited event). */
export const canUpdateFollowUp = (role: UserRole): boolean =>
  role === 'follow_up' || role === 'admin' || role === 'school_doctor' || role === 'teacher'

/** Manage rosters, content versions, and users. */
export const canManageRoster = (role: UserRole): boolean => role === 'admin'
