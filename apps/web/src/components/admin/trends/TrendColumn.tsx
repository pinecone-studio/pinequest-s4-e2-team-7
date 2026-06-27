'use client'

import type { BoardStudent } from '@/hooks/useBoard'
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

export const LEVEL_CLS: Record<string, string> = {
  red:    'bg-triage-red-bg text-triage-red',
  yellow: 'bg-triage-yellow-bg text-triage-yellow',
  green:  'bg-triage-green-bg text-triage-green',
}
const LEVEL_LBL: Record<string, string> = { red: 'Яаралтай', yellow: 'Эмчилгээ', green: 'Хэвийн' }

const LevelPill = ({ level }: { level: string }) => (
  <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${LEVEL_CLS[level] ?? 'bg-surface-raised text-text-muted'}`}>
    {LEVEL_LBL[level] ?? level}
  </span>
)

type ColMeta = { label: string; dotCls: string; countCls: string }
type Props = { meta: ColMeta; cards: BoardStudent[]; onSelect: (s: BoardStudent) => void }

const TrendColumn = ({ meta, cards, onSelect }: Props) => (
  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
    <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12.5px] font-bold ${meta.countCls}`}>
      <span className={`size-2 rounded-full ${meta.dotCls}`} />
      {meta.label}
      <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[11px] tabular-nums shadow-sm">{cards.length}</span>
    </div>

    <div className="flex flex-col gap-2">
      {cards.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/60 py-10 text-center text-[12px] text-text-muted/40">
          Хоосон
        </div>
      ) : cards.map((s) => {
        const prior = s.seasonHistory.at(-2)
        const current = s.seasonHistory.at(-1)
        return (
          <button key={s.id} onClick={() => onSelect(s)}
            className="group flex flex-col gap-2.5 blob border border-border bg-surface p-4 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-card-lg) text-left">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold transition-transform duration-200 group-hover:scale-110 ${LEVEL_CLS[s.latestLevel ?? ''] ?? 'bg-surface-raised text-text-muted'}`}>
                {s.lastName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text-base">{s.lastName} {s.firstName}</p>
                <p className="text-[11px] text-text-muted">{s.className}</p>
              </div>
              <ArrowsPointingOutIcon className="size-4 shrink-0 text-text-muted/30 transition-colors group-hover:text-text-muted" />
            </div>
            {prior && current && (
              <div className="flex items-center gap-2">
                <LevelPill level={prior.effectiveLevel} />
                <span className="text-[11px] text-text-muted">→</span>
                <LevelPill level={current.effectiveLevel} />
                <span className="ml-auto rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-muted">
                  {s.seasonCount} улирал
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  </div>
)

export default TrendColumn
