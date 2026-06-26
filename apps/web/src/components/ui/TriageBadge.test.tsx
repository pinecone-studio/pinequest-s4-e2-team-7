import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TriageBadge } from './TriageBadge'

// Pilot for the design-driven TDD loop: a triage-rendering component must show the
// Mongolian label (not the raw enum), use the design-system token classes, stay safe on
// unknown input, and never leak banned clinical words. See docs/presentation + CLAUDE.md.

describe('TriageBadge', () => {
  it('renders the Mongolian label for each triage level', () => {
    const { rerender } = render(<TriageBadge level="green" />)
    expect(screen.getByText('Ногоон')).toBeInTheDocument()
    rerender(<TriageBadge level="yellow" />)
    expect(screen.getByText('Шар')).toBeInTheDocument()
    rerender(<TriageBadge level="red" />)
    expect(screen.getByText('Улаан')).toBeInTheDocument()
  })

  it('applies the triage token classes (not raw hex)', () => {
    const { container } = render(<TriageBadge level="red" />)
    expect(container.firstChild).toHaveClass('bg-triage-red-bg', 'text-triage-red')
  })

  it('never renders the raw English enum value as visible text', () => {
    render(<TriageBadge level="green" />)
    expect(screen.queryByText('green')).not.toBeInTheDocument()
  })

  it('falls back gracefully for an unknown level without crashing', () => {
    const { container } = render(<TriageBadge level="unknown" />)
    expect(container.firstChild).toHaveClass('bg-border', 'text-text-muted')
  })

  it('carries no banned clinical words (safety contract)', () => {
    const banned = ['cavity', 'caries', 'decay', 'цоорол', 'эрүүл шүд']
    for (const level of ['green', 'yellow', 'red'] as const) {
      const { container } = render(<TriageBadge level={level} />)
      const text = (container.textContent ?? '').toLowerCase()
      for (const word of banned) expect(text).not.toContain(word)
    }
  })
})
