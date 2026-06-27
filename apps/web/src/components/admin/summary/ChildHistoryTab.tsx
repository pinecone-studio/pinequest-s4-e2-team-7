'use client'

import type { TriageLevel } from '@pinequest/types'
import type { ChildSeasonDetail } from '@/hooks/useChildHistory'

const TERM_LABELS: Record<string, string> = { fall: 'Намар', winter: 'Өвөл', spring: 'Хавар' }

const formatSeason = (id: string) => {
  const i = id.lastIndexOf('-')
  if (i < 0) return id
  const term = id.slice(i + 1)
  return `${id.slice(0, i)} ${TERM_LABELS[term] ?? term}`
}

const LEVEL_BADGE: Record<TriageLevel, { label: string; cls: string }> = {
  red:    { label: 'Яаралтай', cls: 'bg-triage-red-bg text-triage-red' },
  yellow: { label: 'Эмчилгээ',  cls: 'bg-triage-yellow-bg text-triage-yellow' },
  green:  { label: 'Хэвийн',    cls: 'bg-triage-green-bg text-triage-green' },
}

const DELTA_CLS: Record<string, { icon: string; cls: string }> = {
  worsened: { icon: '↓', cls: 'text-triage-red' },
  improved: { icon: '↑', cls: 'text-triage-green' },
  stable:   { icon: '→', cls: 'text-text-muted' },
}

/** Newest-first timeline of per-season screening results with delta connectors. */
const ChildHistoryTab = ({ seasons }: { seasons: ChildSeasonDetail[] }) => {
  if (!seasons.length) return (
    <p className="py-8 text-center text-sm text-text-muted">Өмнөх шалгалтын мэдээлэл байхгүй</p>
  )

  return (
    <div className="flex flex-col">
      {seasons.map((s, i) => {
        const badge = LEVEL_BADGE[s.effectiveLevel]
        const delta = s.delta ? DELTA_CLS[s.delta] : null
        const isLast = i === seasons.length - 1
        return (
          <div key={s.seasonId} className="relative flex items-start gap-3 pb-5">
            {!isLast && <div className="absolute left-3 top-6 h-full w-px bg-border" />}
            <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${badge.cls}`}>
              {seasons.length - i}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-semibold text-text-base">{formatSeason(s.seasonId)}</span>
                {delta && <span className={`text-[13px] font-bold ${delta.cls}`}>{delta.icon}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                <span className="ml-auto shrink-0 text-[11px] text-text-muted">
                  {new Date(s.capturedAt).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              {s.flaggedAreas > 0 && (
                <p className="mt-0.5 text-[12px] text-text-muted">{s.flaggedAreas} хэсэг тэмдэглэгдсэн</p>
              )}
              {s.confirmedLevel && s.confirmedLevel !== s.aiLevel && (
                <p className="mt-0.5 text-[11px] text-text-muted">Шүдний эмч баталгаажуулсан</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChildHistoryTab
