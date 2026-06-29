'use client'

import ChildSummaryCard from '@/components/admin/child/ChildSummaryCard'
import { useChildSummary } from '@/hooks/useChildSummary'
import type { BoardStudent } from '@/hooks/useBoard'
import { PageSpinner } from '@/components/ui/Spinner'

/** One linked child, with their latest hedged screening summary + advice. */
const ParentChildCard = ({ student }: { student: BoardStudent }) => {
  const { data, isLoading } = useChildSummary(student.id)
  const name = `${student.lastName} ${student.firstName}`
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-text-base">
        {name} <span className="text-sm font-normal text-text-muted">· {student.className || '—'}</span>
      </h2>
      {isLoading ? (
        <PageSpinner />
      ) : data?.summary ? (
        <ChildSummaryCard childName={name} guardianEmail={student.guardianEmail} summary={data.summary} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface-raised p-4 text-sm text-text-muted">
          Таны хүүхэд хараахан шалгагдаагүй байна.
        </p>
      )}
    </div>
  )
}

export default ParentChildCard
