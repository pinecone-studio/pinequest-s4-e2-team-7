'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import type { TriageLevel } from '@pinequest/types'
import { BulkImportForm } from '@/components/admin/classes/BulkImportForm'
import { RosterTable } from '@/components/admin/classes/RosterTable'
import { TriageRollup } from '@/components/admin/classes/TriageRollup'
import { useChildren } from '@/hooks/useChildren'
import { useScreenings } from '@/hooks/useScreenings'
import { PageSpinner } from '@/components/ui/Spinner'

const TRIAGE_FILTER_MN: Record<string, string> = { red: 'Улаан', yellow: 'Шар', green: 'Ногоон' }

const ClassRosterPage = () => {
  const classId = useParams().classId as string
  const triageFilter = useSearchParams().get('triage')
  const { data: children, isLoading } = useChildren(classId)
  const { data: screenings } = useScreenings({ classId })

  // childKey → latest triage level (screenings come back newest-first)
  const levelByKey = useMemo(() => {
    const map: Record<string, TriageLevel> = {}
    for (const s of screenings ?? []) if (!map[s.childKey]) map[s.childKey] = s.triageLevel
    return map
  }, [screenings])

  // Pre-filter the roster when the triage bar segment was clicked.
  const rows = useMemo(() => {
    const all = children ?? []
    if (!triageFilter) return all
    return all.filter((c) => levelByKey[c.childKey] === triageFilter)
  }, [children, levelByKey, triageFilter])

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dashboard/admin" className="btn inline-flex w-fit items-center gap-1 text-sm text-primary transition-all duration-150 hover:underline">
        Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">Анги — ростер</h1>

      <div className="blob border border-border bg-surface p-4 shadow-(--shadow-card)">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Триаж дүн</h2>
        <TriageRollup classId={classId} />
      </div>

      <div className="blob border border-border bg-surface p-4 shadow-(--shadow-card)">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Ростер импорт</h2>
        <BulkImportForm classId={classId} />
      </div>

      {triageFilter && (
        <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-text-muted">
          Шүүлт: <span className="font-semibold text-text-base">{TRIAGE_FILTER_MN[triageFilter] ?? triageFilter}</span>
          <Link href={`/dashboard/admin/classes/${classId}`} className="font-medium text-primary hover:underline">Цэвэрлэх</Link>
        </div>
      )}

      {isLoading ? (
        <PageSpinner />
      ) : (
        <RosterTable rows={rows} levelByKey={levelByKey} />
      )}
    </section>
  )
}

export default ClassRosterPage
