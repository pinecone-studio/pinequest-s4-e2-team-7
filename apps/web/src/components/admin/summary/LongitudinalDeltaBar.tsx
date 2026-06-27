'use client'

import type { TriageLevel } from '@pinequest/types'

const RANK: Record<string, number> = { green: 0, yellow: 1, red: 2 }
const LEVEL: Record<string, { bg: string; text: string; label: string }> = {
  red:    { bg: 'bg-triage-red-bg',    text: 'text-triage-red',    label: 'Яаралтай' },
  yellow: { bg: 'bg-triage-yellow-bg', text: 'text-triage-yellow', label: 'Эмчилгээ' },
  green:  { bg: 'bg-triage-green-bg',  text: 'text-triage-green',  label: 'Хэвийн' },
}
const SEASON_MN: Record<string, string> = { fall: 'Намар', winter: 'Өвөл', spring: 'Хавар' }

const formatSeason = (id: string) => {
  const [year, s] = id.split('-')
  return `${year} ${SEASON_MN[s] ?? s}`
}

const delta = (prior: string, current: string) => {
  const d = (RANK[current] ?? 0) - (RANK[prior] ?? 0)
  if (d > 0) return { icon: '↓', label: 'Хүндэрсэн', cls: 'text-triage-red' }
  if (d < 0) return { icon: '↑', label: 'Сайжирсан', cls: 'text-triage-green' }
  return { icon: '→', label: 'Өөрчлөгдөөгүй', cls: 'text-text-muted' }
}

type Props = { priorLevel: TriageLevel; currentLevel: TriageLevel; priorSeasonId: string }

/** Compact prior-vs-current triage comparison strip — admin latest tab only. */
const LongitudinalDeltaBar = ({ priorLevel, currentLevel, priorSeasonId }: Props) => {
  const d = delta(priorLevel, currentLevel)
  const p = LEVEL[priorLevel] ?? { bg: 'bg-surface-raised', text: 'text-text-muted', label: priorLevel }
  const c = LEVEL[currentLevel] ?? { bg: 'bg-surface-raised', text: 'text-text-muted', label: currentLevel }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">{formatSeason(priorSeasonId)}</span>
        <span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${p.bg} ${p.text}`}>{p.label}</span>
      </div>
      <span className={`mx-1 text-[18px] font-bold leading-none ${d.cls}`}>{d.icon}</span>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">Одоо</span>
        <span className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold ${c.bg} ${c.text}`}>{c.label}</span>
      </div>
      <span className={`ml-auto text-[13px] font-semibold ${d.cls}`}>{d.label}</span>
    </div>
  )
}

export default LongitudinalDeltaBar
