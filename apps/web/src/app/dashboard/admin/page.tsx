'use client'

import { useScreenings } from '@/hooks/useScreenings'
import { useSeason } from '@/components/shared/SeasonProvider'
import ProfileCard from '@/components/admin/home/ProfileCard'
import DentistReviewQueueCard from '@/components/admin/home/DentistReviewQueueCard'
import NextFollowUpsCard from '@/components/admin/child/NextFollowUpsCard'
import ScreeningBarChart from '@/components/admin/home/ScreeningBarChart'
import ScheduleCalendar from '@/components/admin/home/ScheduleCalendar'
import RecentScreeningsTable from '@/components/admin/home/RecentScreeningsTable'
import SeasonSelector from '@/components/shared/SeasonSelector'
import NotificationBell from '@/components/shared/NotificationBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Disclaimer from '@/components/admin/home/Disclaimer'

const AdminDashboardPage = () => {
  const { seasonId } = useSeason()
  const { data: screenings, isLoading: screeningsLoading } = useScreenings({ seasonId })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-text-base">Мэдээлэл</h1>
          <p className="text-[12.5px] text-text-muted">Үзүүлэлт хамралт ба хяналтын тойм</p>
        </div>
        <div className="flex items-center gap-2">
          <SeasonSelector />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {/* Top row — [left: profile + review queue] [center chart] [right: calendar + next schedule] */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr_300px]">
        <div className="flex flex-col gap-5">
          <ProfileCard />
          <DentistReviewQueueCard />
        </div>

        <ScreeningBarChart />

        <div className="flex flex-col gap-5">
          <ScheduleCalendar />
          <NextFollowUpsCard />
        </div>
      </div>

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} loading={screeningsLoading} />

      <Disclaimer />
    </div>
  )
}

export default AdminDashboardPage
