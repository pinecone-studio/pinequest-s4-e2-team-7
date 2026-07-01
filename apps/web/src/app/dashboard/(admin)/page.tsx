'use client'

import { useState } from 'react'
import { useScreenings } from '@/hooks/useScreenings'
import { useBoardStudents, type BoardStudent } from '@/hooks/useBoard'
import { useSeason } from '@/components/shared/SeasonProvider'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import StudentModal from '@/components/admin/summary/StudentModal'
import ProfileCard from '@/components/admin/home/ProfileCard'
import OverviewStatusStrip from '@/components/admin/home/OverviewStatusStrip'
import UpcomingAppointmentsList from '@/components/admin/home/UpcomingAppointmentsList'
import ScreeningBarChart from '@/components/admin/home/ScreeningBarChart'
import ScheduleCalendar from '@/components/admin/home/ScheduleCalendar'
import RecentScreeningsTable from '@/components/admin/home/RecentScreeningsTable'
import Disclaimer from '@/components/admin/home/Disclaimer'

const AdminDashboardPage = () => {
  const { seasonId } = useSeason()
  const { data: screenings, isLoading: screeningsLoading } = useScreenings({ seasonId })
  const { data: boardStudents } = useBoardStudents()
  const [selected, setSelected] = useState<BoardStudent | null>(null)

  useSetPageHeader({ title: 'Мэдээлэл', subtitle: 'Үзүүлэлт хамралт ба хяналтын тойм' })

  // Clicking a worklist row opens that child's summary modal (same as the summary board).
  const openChild = (childKey: string) => {
    const found = boardStudents?.find((b) => b.childKey === childKey)
    if (found) setSelected(found)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* First screen — status strip + overview grid + disclaimer, together capped to
          the viewport height so the disclaimer always stays visible. The grid flexes to
          fill; tall columns scroll within themselves. The worklist below scrolls in main. */}
      <div className="flex flex-col gap-5 xl:h-[calc(100dvh-8rem)] xl:min-h-0">
        <OverviewStatusStrip />

        {/* [left: profile] [center: activity chart] [right: calendar + booked calls] */}
        <div className="grid grid-cols-1 gap-5 xl:min-h-0 xl:flex-1 xl:grid-cols-[280px_1fr_320px] xl:grid-rows-[minmax(0,1fr)]">
          <ProfileCard />

          <ScreeningBarChart />

          <div className="flex flex-col gap-5 xl:min-h-0 xl:overflow-y-auto">
            <ScheduleCalendar className="xl:shrink-0 xl:grow-0" />
            <UpcomingAppointmentsList />
          </div>
        </div>

        <Disclaimer />
      </div>

      {/* Full-width prioritized worklist */}
      <RecentScreeningsTable screenings={screenings} loading={screeningsLoading} onSelect={openChild} />

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default AdminDashboardPage
