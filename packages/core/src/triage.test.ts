import { describe, it, expect } from 'vitest'
import type { SymptomSet, ToothFinding } from '@pinequest/types'
import { triage } from './triage'

const noSymptoms: SymptomSet = {}
const finding = (confidence: number): ToothFinding => ({
  id: 'f',
  className: 'caries',
  classId: 0,
  confidence,
  box: { x1: 0, y1: 0, x2: 1, y2: 1 },
})

describe('triage', () => {
  it('is green with no findings and no symptoms', () => {
    expect(triage([], noSymptoms).level).toBe('green')
  })

  it('is red on an urgent symptom regardless of the photos', () => {
    expect(triage([], { swelling: true }).level).toBe('red')
    expect(triage([finding(0.1)], { painDisturbingSleepOrEating: true }).level).toBe('red')
  })

  it('is green for a single low-confidence finding', () => {
    expect(triage([finding(0.3)], noSymptoms).level).toBe('green')
  })

  it('is yellow at the moderate-confidence boundary', () => {
    expect(triage([finding(0.45)], noSymptoms).level).toBe('yellow')
  })

  it('is red on high confidence', () => {
    expect(triage([finding(0.8)], noSymptoms).level).toBe('red')
  })

  it('is red on three or more findings even at low confidence', () => {
    expect(triage([finding(0.3), finding(0.3), finding(0.3)], noSymptoms).level).toBe('red')
  })

  it('hedges wording below the confident-wording threshold', () => {
    expect(triage([finding(0.45)], noSymptoms).confidentWording).toBe(false)
    expect(triage([finding(0.8)], noSymptoms).confidentWording).toBe(true)
  })
})
