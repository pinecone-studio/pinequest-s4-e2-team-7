'use client'

import { useBoardStudents } from '@/hooks/useBoard'
import ParentChildCard from '@/components/admin/child/ParentChildCard'
import { PageSpinner } from '@/components/ui/Spinner'

// Parent landing — their own child(ren) only (scope-enforced server-side).
const ChildPage = () => {
  const { data: students, isLoading } = useBoardStudents()

  return (
    <section className="flex max-w-xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Миний хүүхэд</h1>
        <p className="text-sm text-text-muted">Хүүхдийн шүдний урьдчилсан үзүүлэлтийн дүн ба зөвлөмж.</p>
      </header>

      {isLoading ? (
        <PageSpinner />
      ) : !students?.length ? (
        <p className="rounded-xl border border-border bg-surface-raised p-4 text-sm text-text-muted">
          Холбогдсон хүүхэд алга. Бүртгэлдээ хүүхдийн кодоо холбоно уу.
        </p>
      ) : (
        students.map((s) => <ParentChildCard key={s.id} student={s} />)
      )}
    </section>
  )
}

export default ChildPage
