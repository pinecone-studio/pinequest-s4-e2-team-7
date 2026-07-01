'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useMemo } from 'react'
import { MapPinIcon } from '@heroicons/react/24/solid'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { useVolunteerDentists, useRequestHelp } from '@/hooks/useHelp'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { TRIAGE_LABEL } from '@/lib/triage'
import { DentistProfileCard } from './DentistProfileCard'

const VolunteerDentistsMap = dynamic(
  () => import('./VolunteerDentistsMap').then((m) => m.VolunteerDentistsMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-surface-raised" /> }
)

type Props = {
  student: BoardStudent
  detail?: ChildSummaryPayload
}

export const VolunteerDentistSection = ({ student, detail }: Props) => {
  const { data: dentists = [], isLoading } = useVolunteerDentists()
  const requestHelp = useRequestHelp()
  const [view, setView] = useState<'dentists' | 'map'>('dentists')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)
  const [distances, setDistances] = useState<Record<string, number>>({})

  const handleDistances = useCallback((d: Record<string, number>) => {
    setDistances(d)
    // Auto-select the closest dentist that has a location
    const closest = Object.entries(d).sort(([, a], [, b]) => a - b)[0]
    if (closest) setSelectedId(closest[0])
  }, [])

  // Sort by distance when available, otherwise preserve server order
  const sorted = useMemo(() => {
    if (Object.keys(distances).length === 0) return dentists
    return [...dentists].sort((a, b) => (distances[a.id] ?? Infinity) - (distances[b.id] ?? Infinity))
  }, [dentists, distances])

  const handleConnect = (dentist: VolunteerDentist) => {
    if (requested === dentist.id) return
    requestHelp.mutate(
      { childKey: student.childKey, level: 'red', note: `Шаардлагатай эмч: ${dentist.displayName}` },
      { onSuccess: () => setRequested(dentist.id) }
    )
  }

  const headline = detail?.summary?.headline

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-triage-red/30 bg-triage-red-bg/50 p-4">
      <p className="text-[13px] font-bold text-triage-red">{TRIAGE_LABEL.red}</p>

      {headline && (
        <div className="rounded-2xl bg-surface-raised px-3 py-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">Хүүхдийн хяналтын тойм</p>
          <p className="text-[13px] leading-relaxed text-text-base">{headline}</p>
        </div>
      )}

      {/* Эмч / Газрын зураг — one at a time so the modal stays compact */}
      <div className="flex gap-1 rounded-full bg-surface-raised p-1">
        {(['dentists', 'map'] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)}
            className={`btn flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${view === v ? 'bg-primary text-text-on-primary' : 'text-text-muted hover:text-text-base'}`}>
            {v === 'dentists' ? `Эмч${isLoading ? '' : ` (${dentists.length})`}` : 'Газрын зураг'}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <div className="h-64 overflow-hidden rounded-2xl border border-border">
          <VolunteerDentistsMap
            dentists={dentists}
            selectedId={selectedId}
            onSelect={(d) => setSelectedId(d.id)}
            onDistancesReady={handleDistances}
            className="h-full w-full"
          />
        </div>
      ) : isLoading ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-raised" />)}</div>
      ) : sorted.length === 0 ? (
        <p className="text-[13px] text-text-muted">Одоогоор боломжтой сайн дурын эмч байхгүй.</p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {Object.keys(distances).length > 0 && (
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Ойролцоогоор эрэмблэгдсэн</p>
          )}
          {sorted.map((d) => {
            const dist = distances[d.id]
            return (
              <div key={d.id}>
                <DentistProfileCard
                  dentist={d}
                  active={selectedId === d.id}
                  connecting={requestHelp.isPending && selectedId === d.id}
                  onConnect={requested === d.id ? undefined : () => { setSelectedId(d.id); handleConnect(d) }}
                />
                {dist != null && (
                  <p className="ml-3 mt-0.5 flex items-center gap-1 text-[10px] font-medium text-primary"><MapPinIcon className="size-3" /> {dist.toFixed(0)} км</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {requested && (
        <p className="rounded-2xl bg-triage-green-bg px-3 py-2 text-[12px] text-triage-green">
          Хүсэлт илгээгдлээ. Эмч нэвтэрсний дараа холбоо барих болно.
        </p>
      )}
    </div>
  )
}
