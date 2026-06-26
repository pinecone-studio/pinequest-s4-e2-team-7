import { describe, it, expect } from 'vitest'
import { seasonForDate, seasonsForYear, seasonLabelMn, SCREENING_TERMS } from './season'

describe('season', () => {
  it('maps months to fall/winter/spring', () => {
    expect(seasonForDate(new Date(2026, 9, 15))).toBe('2026-fall') // October
    expect(seasonForDate(new Date(2026, 11, 1))).toBe('2026-winter') // December
    expect(seasonForDate(new Date(2026, 1, 10))).toBe('2026-winter') // February
    expect(seasonForDate(new Date(2026, 3, 20))).toBe('2026-spring') // April
  })

  it('treats summer (Jun–Aug break) as the upcoming fall', () => {
    expect(seasonForDate(new Date(2026, 6, 1))).toBe('2026-fall') // July
    expect(SCREENING_TERMS).not.toContain('summer')
  })

  it('lists the three screenable seasons of a year', () => {
    expect(seasonsForYear(2026)).toEqual(['2026-fall', '2026-winter', '2026-spring'])
  })

  it('renders Mongolian labels and passes through unknown ids', () => {
    expect(seasonLabelMn('2026-fall')).toBe('2026 Намар')
    expect(seasonLabelMn('weird-id')).toBe('weird-id')
  })
})
