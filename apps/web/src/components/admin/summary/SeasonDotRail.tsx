'use client'

import type { ChildTrendSnapshot, TriageLevel } from '@pinequest/types'
import type { SeasonSnapshot } from '@/hooks/useBoard'

const DOT_CLS: Record<TriageLevel, string> = {
  red: 'bg-triage-red',
  yellow: 'bg-triage-yellow',
  green: 'bg-triage-green',
}

type TrendInfo = { icon: string; textCls: string; bg: string; label: string } | null
const TREND: Record<string, TrendInfo> = {
  worsened:      { icon: '↓', textCls: 'text-triage-red',    bg: 'bg-triage-red-bg',    label: 'Хүндэрсэн' },
  deteriorating: { icon: '↓', textCls: 'text-triage-red',    bg: 'bg-triage-red-bg',    label: 'Хүндрэх эрсдэлтэй' },
  improved:      { icon: '↑', textCls: 'text-triage-green',  bg: 'bg-triage-green-bg',  label: 'Сайжирсан' },
  improving:     { icon: '↑', textCls: 'text-triage-green',  bg: 'bg-triage-green-bg',  label: 'Сайжирч байна' },
  chronic:       { icon: '⚠', textCls: 'text-triage-yellow', bg: 'bg-triage-yellow-bg', label: 'Архаг' },
  volatile:      { icon: '~', textCls: 'text-text-muted',    bg: 'bg-surface-raised',   label: 'Тогтворгүй' },
  stable:        { icon: '',  textCls: 'text-text-muted',    bg: 'bg-surface-raised',   label: 'Тогтвортой' },
  first_season:  null,
  unscreened:    null,
}

const MAX = 6

type Props = { history: SeasonSnapshot[]; trend: ChildTrendSnapshot | null }

/** Season dots (oldest→newest) + labeled trend pill. Hidden when N < 2. */
const SeasonDotRail = ({ history, trend }: Props) => {
  if (history.length < 2) return null
  const visible = history.slice(-MAX)
  const t: TrendInfo = trend ? (TREND[trend.tag] ?? null) : null

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {history.length > MAX && (
        <span className="text-[10px] text-text-muted">+{history.length - MAX}</span>
      )}
      {visible.map((s) => (
        <span
          key={s.seasonId}
          className={`size-2 shrink-0 rounded-full ${DOT_CLS[s.effectiveLevel] ?? 'bg-border'}`}
          title={s.seasonId}
        />
      ))}
      {t && (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.bg} ${t.textCls}`}>
          {t.icon && `${t.icon} `}{t.label}
        </span>
      )}
    </div>
  )
}

export default SeasonDotRail
