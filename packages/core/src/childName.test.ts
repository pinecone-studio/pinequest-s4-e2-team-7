import { describe, it, expect } from 'vitest'
import { formatChildName } from './childName.js'

describe('formatChildName', () => {
  it('renders family initial + full given name (Б.Бат)', () => {
    expect(formatChildName({ lastName: 'Болд', firstName: 'Бат' })).toBe('Б.Бат')
  })

  it('uppercases the family initial', () => {
    expect(formatChildName({ lastName: 'болд', firstName: 'Бат' })).toBe('Б.Бат')
  })

  it('falls back to whichever part is present', () => {
    expect(formatChildName({ lastName: '', firstName: 'Бат' })).toBe('Бат')
    expect(formatChildName({ lastName: 'Болд', firstName: '' })).toBe('Болд')
  })

  it('handles missing/blank parts without throwing', () => {
    expect(formatChildName({})).toBe('')
    expect(formatChildName({ lastName: null, firstName: null })).toBe('')
    expect(formatChildName({ lastName: '  Болд  ', firstName: '  Бат  ' })).toBe('Б.Бат')
  })
})
