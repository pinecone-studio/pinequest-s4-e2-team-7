'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BulkImportForm } from '@/components/BulkImportForm'
import { RosterTable } from '@/components/RosterTable'
import { TriageRollup } from '@/components/TriageRollup'
import { useChildren } from '@/hooks/useChildren'

const ClassRosterPage = () => {
  const classId = useParams().classId as string
  const { data: children, isLoading } = useChildren(classId)

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-primary hover:underline">
        ← Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">Анги — ростер</h1>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Триаж дүн</h2>
        <TriageRollup classId={classId} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Ростер импорт</h2>
        <BulkImportForm classId={classId} />
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : (
        <RosterTable rows={children ?? []} />
      )}
    </section>
  )
}

export default ClassRosterPage
