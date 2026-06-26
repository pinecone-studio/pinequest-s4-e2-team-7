'use client'

import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import { useReviewQueue } from '@/hooks/useScreening'
import HeroStrip from '@/components/shared/HeroStrip'
import UrgentActionCard from '@/components/shared/UrgentActionCard'
import ReviewQueueCard from '@/components/dentist/ReviewQueueCard'
import EmptyState from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'

const DentistQueuePage = () => {
  const { data, isLoading } = useReviewQueue()
  const pending = (data ?? []).filter((s) => !s.review) // unreviewed only — confirmed items leave the queue

  const oldestRed = pending
    .filter((s) => s.triageLevel === 'red')
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())[0]

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      {oldestRed && (
        <UrgentActionCard
          tone="red"
          title="Яаралтай улаан үзүүлэлт хянагдаагүй байна"
          body={`Хамгийн эртний: ${new Date(oldestRed.capturedAt).toLocaleDateString('mn-MN')} · ${oldestRed.childKey.slice(0, 16)}`}
          ctaLabel="Хянах"
          ctaHref={`/dashboard/dentist/screenings/${oldestRed.id}`}
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Хянах дараалал</h2>

      {isLoading ? (
        <PageSpinner />
      ) : pending.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pending.map((s) => <ReviewQueueCard key={s.id} row={s} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
          <EmptyState Icon={ClipboardDocumentCheckIcon} title="Хянах үзүүлэлт алга" hint="Шинэ үзүүлэлт ирэхэд баталгаажуулах жагсаалт энд гарна." />
        </div>
      )}
    </section>
  )
}

export default DentistQueuePage
