/**
 * Roles describe CAPABILITY, not coverage.
 * Coverage (which school/class/child a user can see) is expressed via UserScopeGrant.
 * - screener:      NON-DENTAL capturer — soum worker / generic capturer
 * - teacher:       owns their own class roster + screening schedule; class-scoped views
 * - parent:        sees ONLY their own child (via ParentChildLink); child-scoped views
 * - school_doctor: oversees a whole school — all classes + teachers; school-scoped views
 * - dentist:       dental professional — full chart; confirm/override (audited); volunteer help
 * - follow_up:     legacy soum worklist (deprecated in UI; folded into role-scoped Хяналт)
 * - admin:         rosters, content versions, users, metrics
 */
export type UserRole =
  | 'screener'
  | 'teacher'
  | 'parent'
  | 'school_doctor'
  | 'dentist'
  | 'follow_up'
  | 'admin'

/** Scope hierarchy: district > school > class > child */
export type ScopeKind = 'child' | 'class' | 'school' | 'district'

export interface UserScopeGrant {
  scopeKind: ScopeKind
  scopeId: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  /** Primary school fast-path; still required for single-school users. */
  schoolId?: string
  /** Granular scope grants — populated for multi-scope or parent users. */
  scopes?: UserScopeGrant[]
  isActive: boolean
  createdAt: string
}
