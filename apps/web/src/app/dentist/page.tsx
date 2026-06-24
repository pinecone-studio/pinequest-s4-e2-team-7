'use client'

import Link from 'next/link'
import { TriageBadge } from '@/components/TriageBadge'
import { useReviewQueue } from '@/hooks/useScreening'
import HeroStrip from '@/components/dashboard/HeroStrip'
import UrgentActionCard from '@/components/dashboard/UrgentActionCard'

const DentistQueuePage = () => {
  const { data, isLoading } = useReviewQueue()

  const oldestRed = data
    ?.filter(s => s.triageLevel === 'red')
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())[0]

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      {oldestRed && (
        <UrgentActionCard
          tone="red"
          title="Яаралтай улаан скрининг хянагдаагүй байна"
          body={`Хамгийн эртний: ${new Date(oldestRed.capturedAt).toLocaleDateString('mn-MN')} · ${oldestRed.childKey}`}
          ctaLabel="Хянах"
          ctaHref={`/dentist/screenings/${oldestRed.id}`}
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Хянах дараалал</h2>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {data.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dentist/screenings/${s.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:bg-primary-subtle"
              >
                <TriageBadge level={s.triageLevel} />
                <span className="text-text-base">
                  {new Date(s.capturedAt).toLocaleDateString('mn-MN')}
                </span>
                <span className="font-mono text-xs text-text-muted">{s.childKey}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">Хянах скрининг алга.</p>
      )}
    </section>
  )
}

export default DentistQueuePage
