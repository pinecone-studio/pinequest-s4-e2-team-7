'use client'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { FollowUpRow } from '@/components/follow-up/FollowUpRow'
import { useFollowUps } from '@/hooks/useFollowUps'
import HeroStrip from '@/components/shared/HeroStrip'
import UrgentActionCard from '@/components/shared/UrgentActionCard'
import EmptyState from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'

const FollowUpWorklistPage = () => {
  const { data, isLoading } = useFollowUps()

  const flagged = data?.filter(f => f.status === 'flagged') ?? []

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      {flagged.length > 0 && (
        <UrgentActionCard
          tone="yellow"
          title={`${flagged.length} хүүхэд дагах шаардлагатай`}
          body="Холбогдож, эмчид уламжлах эсэхийг шийдэх шаардлагатай."
          ctaLabel="Дагах жагсаалт харах"
          ctaHref="/dashboard/follow-up"
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Дагах жагсаалт</h2>

      {isLoading ? (
        <PageSpinner />
      ) : data && data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-text-muted">Хүүхэд</th>
                <th className="px-4 py-3 font-medium text-text-muted">Асран хамгаалагч</th>
                <th className="px-4 py-3 font-medium text-text-muted">Төлөв</th>
                <th className="px-4 py-3 font-medium text-text-muted">Өөрчлөх</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <FollowUpRow key={r.id} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
          <EmptyState Icon={CheckCircleIcon} title="Дагах жагсаалт хоосон" hint="Хянагдсан үзүүлэлт ирэхэд дагах шаардлагатай хүүхдүүд энд харагдана." />
        </div>
      )}
    </section>
  )
}

export default FollowUpWorklistPage
