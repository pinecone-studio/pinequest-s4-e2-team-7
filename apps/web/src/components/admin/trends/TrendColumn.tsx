'use client'

import type { BoardStudent } from '@/hooks/useBoard'
import { ArrowsPointingOutIcon } from '@heroicons/react/24/solid'

export const LEVEL_CLS: Record<string, string> = {
  red:    'bg-triage-red-bg text-triage-red',
  yellow: 'bg-triage-yellow-bg text-triage-yellow',
  green:  'bg-triage-green-bg text-triage-green',
}
const LEVEL_LBL: Record<string, string> = { red: 'Яаралтай', yellow: 'Эмчилгээ', green: 'Хэвийн' }
const RANK: Record<string, number> = { green: 0, yellow: 1, red: 2 }

// Worse = red, better = green, same = muted (matches LongitudinalDeltaBar).
const deltaFor = (prior: string, current: string) => {
  const d = (RANK[current] ?? 0) - (RANK[prior] ?? 0)
  if (d > 0) return { label: 'Хүндрэх эрсдэлтэй', cls: 'text-triage-red' }
  if (d < 0) return { label: 'Сайжирсан', cls: 'text-triage-green' }
  return { label: 'Тогтвортой', cls: 'text-text-muted' }
}

const LevelPill = ({ level }: { level: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${LEVEL_CLS[level] ?? 'bg-surface-raised text-text-muted'}`}>
    {LEVEL_LBL[level] ?? level}
  </span>
)

const TrendCard = ({ s, onSelect }: { s: BoardStudent; onSelect: (s: BoardStudent) => void }) => {
  const prior = s.seasonHistory.at(-2)
  const current = s.seasonHistory.at(-1)
  const d = prior && current ? deltaFor(prior.effectiveLevel, current.effectiveLevel) : null
  return (
    <button onClick={() => onSelect(s)}
      className="group flex w-full flex-col gap-3 rounded-[1.75rem] border border-border bg-surface p-4 text-left shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-(--shadow-card-lg)">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-transform duration-200 group-hover:scale-105 ${LEVEL_CLS[s.latestLevel ?? ''] ?? 'bg-surface-raised text-text-muted'}`}>
          {s.lastName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-text-base">{s.lastName} {s.firstName}</p>
          <p className="text-[11px] text-text-muted">{s.className} {s.seasonCount} улирал</p>
        </div>
        <ArrowsPointingOutIcon className="size-4 shrink-0 text-text-muted/30 transition-colors group-hover:text-primary" />
      </div>
      {prior && current && d && (
        <div className="flex items-center gap-2 rounded-full bg-surface-raised/70 px-3 py-2">
          <LevelPill level={prior.effectiveLevel} />
          <LevelPill level={current.effectiveLevel} />
          <span className={`ml-auto text-[11px] font-semibold ${d.cls}`}>{d.label}</span>
        </div>
      )}
    </button>
  )
}

type ColMeta = { label: string; dotCls: string; countCls: string }
type Props = { meta: ColMeta; cards: BoardStudent[]; onSelect: (s: BoardStudent) => void }

const TrendColumn = ({ meta, cards, onSelect }: Props) => (
  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
    <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12.5px] font-bold ${meta.countCls}`}>
      <span className={`size-2 rounded-full ${meta.dotCls}`} />
      {meta.label}
      <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[11px] tabular-nums shadow-sm">{cards.length}</span>
    </div>

    <div className="flex flex-col gap-2.5">
      {cards.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border/60 py-10 text-center text-[12px] text-text-muted/40">
          Хоосон
        </div>
      ) : cards.map((s) => <TrendCard key={s.id} s={s} onSelect={onSelect} />)}
    </div>
  </div>
)

export default TrendColumn
