import type { SeasonId } from './common'

/** A school or soum location node that holds rosters. */
export interface School {
  id: string
  name: string
  /** Soum/aimag location code. */
  soumCode?: string
  district?: string
  createdAt: string
}

/** A class roster for one school + class + season. */
export interface SchoolClass {
  id: string
  schoolId: string
  /** Class label, e.g. "3A". */
  name: string
  seasonId: SeasonId
  gradeLevel?: number
  /** Carry-forward pointer to the prior season's class this was promoted from. */
  sourceClassId?: string
  isActive: boolean
  createdAt: string
}

/** Promote a class into a new season (carry the roster forward). */
export interface CarryForwardInput {
  sourceClassId: string
  newSeasonId: SeasonId
  /** Defaults to the source class name. */
  newName?: string
}
