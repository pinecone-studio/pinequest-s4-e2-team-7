'use client'

import { useReviewQueue } from '@/hooks/useScreening'
import HeroStrip from '@/components/dashboard/HeroStrip'
import UrgentActionCard from '@/components/dashboard/UrgentActionCard'
import ReviewQueueCard from '@/components/dashboard/ReviewQueueCard'

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
          title="Яаралтай улаан скрининг хянагдаагүй байна"
          body={`Хамгийн эртний: ${new Date(oldestRed.capturedAt).toLocaleDateString('mn-MN')} · ${oldestRed.childKey.slice(0, 16)}`}
          ctaLabel="Хянах"
          ctaHref={`/dashboard/dentist/screenings/${oldestRed.id}`}
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Хянах дараалал</h2>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : pending.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pending.map((s) => <ReviewQueueCard key={s.id} row={s} />)}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Хянах скрининг алга.</p>
      )}
    </section>
  )
}

export default DentistQueuePage
