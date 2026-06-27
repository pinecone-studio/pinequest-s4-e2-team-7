'use client'

import type { ChildTrendSnapshot, TriageLevel } from '@pinequest/types'
import type { SeasonSnapshot } from '@/hooks/useBoard'

const DOT_CLS: Record<TriageLevel, string> = {
  red: 'bg-triage-red',
  yellow: 'bg-triage-yellow',
  green: 'bg-triage-green',
}

type ArrowInfo = { icon: string; cls: string } | null
const TREND_ARROW: Record<string, ArrowInfo> = {
  improved:      { icon: '↑', cls: 'text-triage-green' },
  improving:     { icon: '↑', cls: 'text-triage-green' },
  worsened:      { icon: '↓', cls: 'text-triage-red' },
  deteriorating: { icon: '↓', cls: 'text-triage-red' },
  stable:        { icon: '→', cls: 'text-text-muted' },
  chronic:       { icon: '⚠', cls: 'text-triage-yellow' },
  volatile:      { icon: '~', cls: 'text-text-muted' },
  first_season:  null,
  unscreened:    null,
}

const MAX = 6

type Props = { history: SeasonSnapshot[]; trend: ChildTrendSnapshot | null }

/** Colored season dots (oldest left → newest right) + direction arrow. Hidden when N < 2. */
const SeasonDotRail = ({ history, trend }: Props) => {
  if (history.length < 2) return null
  const visible = history.slice(-MAX)
  const arrow: ArrowInfo = trend ? (TREND_ARROW[trend.tag] ?? null) : null

  return (
    <div className="flex items-center gap-1">
      {history.length > MAX && (
        <span className="mr-0.5 text-[10px] text-text-muted">+{history.length - MAX}</span>
      )}
      {visible.map((s) => (
        <span
          key={s.seasonId}
          className={`size-2 shrink-0 rounded-full ${DOT_CLS[s.effectiveLevel] ?? 'bg-border'}`}
          title={s.seasonId}
        />
      ))}
      {arrow && (
        <span className={`ml-1 text-[13px] font-bold leading-none ${arrow.cls}`}>{arrow.icon}</span>
      )}
    </div>
  )
}

export default SeasonDotRail
