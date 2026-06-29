'use client'

import type { TriageLevel } from '@pinequest/types'
import { formatSeason } from '@/lib/season'

const RANK: Record<string, number> = { green: 0, yellow: 1, red: 2 }
const LEVEL: Record<string, { bg: string; text: string; label: string }> = {
  red:    { bg: 'bg-triage-red-bg',    text: 'text-triage-red',    label: 'Яаралтай' },
  yellow: { bg: 'bg-triage-yellow-bg', text: 'text-triage-yellow', label: 'Эмчилгээ' },
  green:  { bg: 'bg-triage-green-bg',  text: 'text-triage-green',  label: 'Хэвийн' },
}

const delta = (prior: string, current: string): { label: string; cls: string } => {
  const d = (RANK[current] ?? 0) - (RANK[prior] ?? 0)
  if (d > 0) return { label: 'Хүндрэх эрсдэлтэй', cls: 'text-triage-red' }
  if (d < 0) return { label: 'Сайжирсан', cls: 'text-triage-green' }
  return { label: 'Өөрчлөгдөөгүй', cls: 'text-text-muted' }
}

type Slot = { bg: string; text: string; label: string }
const Column = ({ title, sub, slot }: { title: string; sub: string; slot: Slot }) => (
  <div className="flex flex-1 flex-col items-center gap-1">
    <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">{title}</span>
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${slot.bg} ${slot.text}`}>{slot.label}</span>
    <span className="text-[10px] text-text-muted/70">{sub}</span>
  </div>
)

type Props = { priorLevel: TriageLevel; currentLevel: TriageLevel; priorSeasonId: string }

/** Compact prior-vs-current triage comparison strip — admin latest tab only. */
const LongitudinalDeltaBar = ({ priorLevel, currentLevel, priorSeasonId }: Props) => {
  const { label, cls } = delta(priorLevel, currentLevel)
  const p = LEVEL[priorLevel] ?? { bg: 'bg-surface-raised', text: 'text-text-muted', label: priorLevel }
  const c = LEVEL[currentLevel] ?? { bg: 'bg-surface-raised', text: 'text-text-muted', label: currentLevel }

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-3">
      <div className="flex items-center gap-2">
        <Column title="Өмнөх дүгнэлт" sub={formatSeason(priorSeasonId)} slot={p} />
        <div className="h-10 w-px bg-border" />
        <Column title="Сүүлийн дүгнэлт" sub="Одоо" slot={c} />
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-border pt-2">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">Улиралын динамик</span>
        <span className={`text-[13px] font-semibold ${cls}`}>{label}</span>
      </div>
    </div>
  )
}

export default LongitudinalDeltaBar
