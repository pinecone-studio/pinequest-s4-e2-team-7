'use client'

import { useStats } from '@/hooks/useStats'
import { useFollowUps } from '@/hooks/useFollowUps'
import { useScreenings } from '@/hooks/useScreenings'
import ProfileCard from '@/components/dashboard/ProfileCard'
import TriageCard from '@/components/dashboard/TriageCard'
import ScreeningBarChart from '@/components/dashboard/ScreeningBarChart'
import MonthlyOverviewCard from '@/components/dashboard/MonthlyOverviewCard'
import FollowUpSummaryCard from '@/components/dashboard/FollowUpSummaryCard'
import RecentScreeningsTable from '@/components/dashboard/RecentScreeningsTable'

const AdminDashboardPage = () => {
  const { data: stats } = useStats()
  const { data: followUps } = useFollowUps()
  const { data: screenings } = useScreenings({ limit: 5 })

  return (
    <div className="flex flex-col gap-5">
      {/* Top row — [left: profile + triage + follow-up] [center chart] [right gold KPI] */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr_300px]">
        <div className="flex flex-col gap-5">
          <ProfileCard />
          <TriageCard stats={stats} />
          <FollowUpSummaryCard followUps={followUps} />
        </div>

        <ScreeningBarChart />

        <MonthlyOverviewCard />
      </div>

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} />
    </div>
  )
}

export default AdminDashboardPage
