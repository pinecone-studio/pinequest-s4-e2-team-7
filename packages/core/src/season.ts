import type { SeasonId } from '@pinequest/types'

/**
 * Screening runs at least once per school term. Summer (Jun–Aug) is a break and is
 * NEVER screened, so a season is one of three terms keyed by calendar year:
 * `"{year}-{term}"` (e.g. "2026-fall"), matching the season ids already in the data.
 */
export type SeasonTerm = 'fall' | 'winter' | 'spring'

export const SCREENING_TERMS: readonly SeasonTerm[] = ['fall', 'winter', 'spring']

const TERM_LABEL_MN: Record<SeasonTerm, string> = {
  fall: 'Намар',
  winter: 'Өвөл',
  spring: 'Хавар',
}

/** Calendar month (1–12) → term; Jun–Aug (summer break) resolve to the upcoming fall. */
const termForMonth = (month: number): SeasonTerm => {
  if (month >= 9 && month <= 11) return 'fall'
  if (month === 12 || month <= 2) return 'winter'
  if (month >= 3 && month <= 5) return 'spring'
  return 'fall' // summer break — next screening is the fall term
}

/** Map a date to its season id; summer dates fall through to that year's fall term. */
export const seasonForDate = (date: Date): SeasonId =>
  `${date.getFullYear()}-${termForMonth(date.getMonth() + 1)}`

/** The three screenable seasons of a calendar year, ordered fall → winter → spring. */
export const seasonsForYear = (year: number): SeasonId[] =>
  SCREENING_TERMS.map((term) => `${year}-${term}`)

const parseSeason = (seasonId: SeasonId): { year: string; term?: SeasonTerm } => {
  const [year, term] = seasonId.split('-')
  return { year, term: SCREENING_TERMS.includes(term as SeasonTerm) ? (term as SeasonTerm) : undefined }
}

/** Mongolian label, e.g. "2026 Намар"; unrecognised ids pass through unchanged. */
export const seasonLabelMn = (seasonId: SeasonId): string => {
  const { year, term } = parseSeason(seasonId)
  return term ? `${year} ${TERM_LABEL_MN[term]}` : seasonId
}
