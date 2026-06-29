'use client'

import Link from 'next/link'
import { ArrowUpRightIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid'
import { useReviewQueue } from '@/hooks/useScreening'
import { useSeason } from '@/components/shared/SeasonProvider'
import PlayCard from '@/components/ui/PlayCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)

// Clinical approval gate: screenings awaiting dentist confirm (review == null).
const DentistReviewQueueCard = () => {
  const { seasonId } = useSeason()
  const { data, isLoading } = useReviewQueue(seasonId)
  if (isLoading) return <SkeletonCard rows={1} />

  const awaiting = (data ?? []).filter((r) => !r.review)
  const highPri  = awaiting.filter((r) => r.triageLevel === 'red').length
  const oldest   = awaiting.reduce((m, r) => Math.max(m, daysSince(r.capturedAt)), 0)

  return (
    <PlayCard tone="surface" delay={1}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Эмчтэй холбогдсон сурагчид</h2>
        <Link
          href="/dashboard/dentist"
          aria-label="Хяналт руу"
          className="tap flex size-8 items-center justify-center rounded-full bg-surface-raised text-text-muted transition-colors hover:bg-border hover:text-text-base"
        >
          <ArrowUpRightIcon className="size-4 icon-spin" />
        </Link>
      </div>

      {awaiting.length === 0 ? (
        <EmptyState Icon={ClipboardDocumentCheckIcon} title="Хүлээгдэж буй хүүхэд алга" hint="Бүх үзүүлэлт баталгаажсан." compact />
      ) : (
        <Link href="/dashboard/dentist" className="grow flex items-center gap-3 rounded-2xl bg-surface-raised p-3 hover:shadow-(--shadow-card)">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-[15px] font-bold text-primary">
            {awaiting.length}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-base">{awaiting.length} баталгаажуулах хүлээгдэж буй</p>
            <p className="text-[11.5px] text-text-muted">
             {highPri} хүүхдэд  яаралтай эмчилгээ шаардлагатай {oldest} хоног
            </p>
          </div>
        </Link>
      )}
    </PlayCard>
  )
}

export default DentistReviewQueueCard
