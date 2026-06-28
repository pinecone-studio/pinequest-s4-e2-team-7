'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { useVolunteerDentists, useRequestHelp } from '@/hooks/useHelp'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { DentistProfileCard } from './DentistProfileCard'

const VolunteerDentistsMap = dynamic(
  () => import('./VolunteerDentistsMap').then((m) => m.VolunteerDentistsMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-surface-raised" /> }
)

type Props = {
  student: BoardStudent
  detail?: ChildSummaryPayload
}

export const VolunteerDentistSection = ({ student, detail }: Props) => {
  const { data: dentists = [], isLoading } = useVolunteerDentists()
  const requestHelp = useRequestHelp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)

  const headline = detail?.summary?.headline

  const handleConnect = (dentist: VolunteerDentist) => {
    if (requested === dentist.id) return
    requestHelp.mutate(
      { childKey: student.childKey, level: 'red', note: `Шаардлагатай эмч: ${dentist.displayName}` },
      { onSuccess: () => setRequested(dentist.id) }
    )
  }

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-triage-red/30 bg-red-50/40 p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 items-center rounded-full bg-triage-red px-2.5 text-[11px] font-bold tracking-wide text-white">
          УЛААН
        </span>
        <p className="text-[13px] font-semibold text-text-base">Сайн дурын эмчтэй холбогдох</p>
      </div>

      {headline && (
        <div className="rounded-xl bg-white/70 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">Хүүхдийн хяналтын тойм</p>
          <p className="text-[13px] leading-relaxed text-text-base">{headline}</p>
        </div>
      )}

      <div className="h-52 overflow-hidden rounded-xl border border-border">
        <VolunteerDentistsMap
          dentists={dentists}
          selectedId={selectedId}
          onSelect={(d) => setSelectedId(d.id)}
          className="h-full w-full"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Боломжтой эмч нар {isLoading ? '…' : `(${dentists.length})`}
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-raised" />
            ))}
          </div>
        ) : dentists.length === 0 ? (
          <p className="text-[13px] text-text-muted">Одоогоор боломжтой сайн дурын эмч байхгүй.</p>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {dentists.map((d) => (
              <DentistProfileCard
                key={d.id}
                dentist={d}
                active={selectedId === d.id}
                connecting={requestHelp.isPending && selectedId === d.id}
                onConnect={requested === d.id ? undefined : () => {
                  setSelectedId(d.id)
                  handleConnect(d)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {requested && (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-[12px] text-green-700">
          Хүсэлт илгээгдлээ. Эмч нэвтэрсний дараа холбоо барих болно.
        </p>
      )}
    </div>
  )
}
