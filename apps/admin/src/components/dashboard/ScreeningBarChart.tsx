'use client'

import { useState } from 'react'
import type { DashStats } from '@/hooks/useStats'
import { SkeletonChart } from '@/components/ui/Skeleton'

type Props = { stats: DashStats | undefined }
type Bar  = { label: string; value: number }

const Y_TICKS = 4

const ScreeningBarChart = ({ stats }: Props) => {
  const [view, setView] = useState<'uliral' | 'tarhalt'>('uliral')

  if (!stats) return <SkeletonChart />

  const bars: Bar[] = view === 'uliral'
    ? [
        { label: 'Нийт',    value: stats.totalScreened },
        { label: 'Аюулгүй', value: stats.triage.green },
        { label: 'Анхаар',  value: stats.triage.yellow },
        { label: 'Яаралтай',value: stats.triage.red },
        { label: 'Хянасан', value: stats.totalScreened - stats.pendingReview },
        { label: 'Дагах',   value: stats.flaggedFollowUps },
      ]
    : [
        { label: 'Аюулгүй',    value: stats.triage.green },
        { label: 'Анхааруулга',value: stats.triage.yellow },
        { label: 'Яаралтай',   value: stats.triage.red },
      ]

  const max  = Math.max(...bars.map((b) => b.value), 1)
  const step = Math.ceil(max / Y_TICKS)
  const yMax = step * Y_TICKS

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card) transition-shadow duration-200 hover:shadow-(--shadow-card-lg)" style={{ minHeight: 340 }}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-text-base">Скрининг идэвх</h2>
          <p className="mt-0.5 text-[11px] text-text-muted">Нийт {stats.totalScreened} скрининг</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-border bg-surface-raised p-0.5">
          {(['uliral', 'tarhalt'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`btn rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                view === v ? 'bg-text-base text-surface shadow-sm' : 'text-text-muted hover:text-text-base'
              }`}
            >
              {v === 'uliral' ? 'Улирал' : 'Тархалт'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col" style={{ minHeight: 200 }}>
        {Array.from({ length: Y_TICKS + 1 }, (_, i) => i).map((i) => (
          <div key={i} className="pointer-events-none absolute left-0 right-0 flex items-center" style={{ bottom: `${(i / Y_TICKS) * 100}%` }}>
            <span className="w-8 shrink-0 pr-2 text-right text-[10px] text-text-muted">{step * i}</span>
            <div className="flex-1 border-t border-dashed border-border-muted" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-end gap-2 pl-10 pb-6">
          {bars.map((bar) => {
            const h = (bar.value / yMax) * 100
            return (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
                {bar.value > 0 && <span className="text-[10px] font-semibold text-text-muted">{bar.value}</span>}
                <div className="flex w-full flex-col-reverse" style={{ height: 160 }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(h, bar.value > 0 ? 4 : 0)}%`,
                      backgroundColor: 'var(--color-primary)',
                      opacity: 0.5 + (bar.value / yMax) * 0.5,
                    }}
                  />
                </div>
                <span className="text-center text-[9px] leading-tight text-text-muted">{bar.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ScreeningBarChart
