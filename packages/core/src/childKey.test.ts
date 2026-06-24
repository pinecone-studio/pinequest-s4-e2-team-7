import { describe, it, expect } from 'vitest'
import { childKey } from './childKey'

const base = { schoolId: 'school-1', className: '3A', rosterSlot: 7, birthYear: 2017 }

describe('childKey', () => {
  it('is deterministic for the same inputs', () => {
    expect(childKey(base)).toBe(childKey(base))
  })

  it('is stable across class-name casing and whitespace', () => {
    expect(childKey({ ...base, className: '  3a ' })).toBe(childKey(base))
  })

  it('is a 16-char hex token (carries no PII)', () => {
    expect(childKey(base)).toMatch(/^[0-9a-f]{16}$/)
  })

  it('changes when any identity field changes', () => {
    const k = childKey(base)
    expect(childKey({ ...base, rosterSlot: 8 })).not.toBe(k)
    expect(childKey({ ...base, birthYear: 2016 })).not.toBe(k)
    expect(childKey({ ...base, schoolId: 'school-2' })).not.toBe(k)
    expect(childKey({ ...base, className: '3B' })).not.toBe(k)
  })
})
