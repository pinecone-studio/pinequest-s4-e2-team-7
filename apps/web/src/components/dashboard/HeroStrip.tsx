'use client'

import { useSession } from '@/components/providers'
import { useReviewQueue } from '@/hooks/useScreening'
import { useFollowUps } from '@/hooks/useFollowUps'
import StatChip from './StatChip'

const HeroStrip = () => {
  const { role } = useSession()
  const { data: queue } = useReviewQueue()
  const { data: followUps } = useFollowUps()

  const totalQueue = queue?.length ?? 0
  const redQueue = queue?.filter(q => q.triageLevel === 'red').length ?? 0
  const flaggedCount = followUps?.filter(f => f.status === 'flagged').length ?? 0
  const uncontactedCount = followUps?.filter(f => f.status === 'flagged').length ?? 0

  return (
    <div className="mb-6 rounded-2xl bg-surface border border-border p-6">
      <p className="mb-4 text-lg font-semibold text-text-base">
        {role === 'admin' && 'Самбар'}
        {role === 'dentist' && 'Хяналтын дараалал'}
        {role === 'follow_up' && 'Дагах жагсаалт'}
      </p>

      <div className="flex flex-wrap gap-3">
        {(role === 'admin' || role === 'dentist') && (
          <>
            <StatChip
              label="Хянах скрининг"
              value={totalQueue}
              href="/dentist"
            />
            <StatChip
              label="Улаан (яаралтай)"
              value={redQueue}
              tone={redQueue > 0 ? 'red' : 'neutral'}
              href="/dentist"
            />
          </>
        )}
        {(role === 'admin' || role === 'follow_up') && (
          <>
            <StatChip
              label="Дагах хүлээж буй"
              value={flaggedCount}
              tone={flaggedCount > 0 ? 'yellow' : 'neutral'}
              href="/follow-up"
            />
            {role === 'follow_up' && (
              <StatChip
                label="Холбогдоогүй"
                value={uncontactedCount}
                tone={uncontactedCount > 0 ? 'red' : 'neutral'}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HeroStrip
