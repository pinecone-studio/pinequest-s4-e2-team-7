'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type ClassInfo = { name: string; count: number }

type Props = {
  q: string; onQ: (v: string) => void
  classFilter: string; onClass: (v: string) => void
  trendFilter: boolean; onTrend: (v: boolean) => void
  classes: ClassInfo[]
  totalCount: number
  isLoading: boolean
}

const chip = (active: boolean, danger = false) =>
  `btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
    active
      ? danger ? 'bg-triage-red text-white' : 'bg-primary text-text-on-primary'
      : danger
        ? 'border border-border bg-surface text-text-muted hover:border-triage-red hover:text-triage-red'
        : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
  }`

const SummaryFilterBar = ({ q, onQ, classFilter, onClass, trendFilter, onTrend, classes, totalCount, isLoading }: Props) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Нэр, ангиар хайх…"
        aria-label="Сурагч хайх"
        className="w-52 rounded-xl border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <button onClick={() => onTrend(!trendFilter)} className={chip(trendFilter, true)}>
      ↓ Хүнддэж байгаа
    </button>

    {!isLoading && classes.length > 1 && (
      <>
        <div className="h-5 w-px bg-border" />
        <button onClick={() => onClass('')} className={chip(classFilter === '')}>
          Бүгд <span className="ml-1 opacity-70">{totalCount}</span>
        </button>
        {classes.map((cls) => (
          <button
            key={cls.name}
            onClick={() => onClass(cls.name === classFilter ? '' : cls.name)}
            className={chip(classFilter === cls.name)}
          >
            {cls.name} <span className="ml-1 opacity-70">{cls.count}</span>
          </button>
        ))}
      </>
    )}
  </div>
)

export default SummaryFilterBar
