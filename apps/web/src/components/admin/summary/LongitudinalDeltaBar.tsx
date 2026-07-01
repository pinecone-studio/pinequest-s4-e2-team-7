'use client'

import type { TriageLevel } from '@pinequest/types'
import { formatSeason } from '@/lib/season'
import { TRIAGE_SHORT, TRIAGE_SOFT, TRIAGE_TEXT } from '@/lib/triage'

const RANK: Record<string, number> = { green: 0, yellow: 1, red: 2 }

const delta = (prior: string, current: string): { label: string; cls: string } => {
  const d = (RANK[current] ?? 0) - (RANK[prior] ?? 0)
  if (d > 0) return { label: 'Хүндрэх эрсдэлтэй', cls: 'text-triage-red' }
  if (d < 0) return { label: 'Сайжирсан', cls: 'text-triage-green' }
  return { label: 'Өөрчлөгдөөгүй', cls: 'text-text-muted' }
}

type Slot = { bg: string; text: string; label: string }
const slotFor = (l: TriageLevel): Slot => ({ bg: TRIAGE_SOFT[l], text: TRIAGE_TEXT[l], label: TRIAGE_SHORT[l] })

// slot=undefined → empty state (dashed placeholder), used when the child has no prior screening yet.
const Column = ({ title, sub, slot }: { title: string; sub: string; slot?: Slot }) => (
  <div className="flex flex-1 flex-col items-center gap-1">
    <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">{title}</span>
    {slot
      ? <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${slot.bg} ${slot.text}`}>{slot.label}</span>
      : <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-[12px] font-medium text-text-muted/50">—</span>}
    <span className="text-[10px] text-text-muted/70">{sub}</span>
  </div>
)

type Props = { currentLevel: TriageLevel; prior?: { level: TriageLevel; seasonId: string } }

/** Prior-vs-current triage comparison strip. With no prior screening, the left
 *  column + seasonal-dynamic show an empty "Эхний үзлэг" (first visit) state. */
const LongitudinalDeltaBar = ({ currentLevel, prior }: Props) => {
  const c = slotFor(currentLevel)
  const p = prior ? slotFor(prior.level) : undefined
  const dyn = prior ? delta(prior.level, currentLevel) : { label: 'Эхний үзлэг', cls: 'text-text-muted' }

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-3">
      <div className="flex items-center gap-2">
        <Column title="Өмнөх дүгнэлт" sub={prior ? formatSeason(prior.seasonId) : 'Байхгүй'} slot={p} />
        <div className="h-10 w-px bg-border" />
        <Column title="Сүүлийн дүгнэлт" sub="Одоо" slot={c} />
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-border pt-2">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">Улиралын динамик</span>
        <span className={`text-[13px] font-semibold ${dyn.cls}`}>{dyn.label}</span>
      </div>
    </div>
  )
}

export default LongitudinalDeltaBar
