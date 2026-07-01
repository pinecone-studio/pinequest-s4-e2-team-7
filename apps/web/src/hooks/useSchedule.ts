import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type ScheduleEvent = {
  id: string
  kind: 'visit' | 'followup' | 'appointment'
  date: string
  title: string
  subtitle: string | null
  schoolId: string
}

/** Upcoming + past calendar events (class visits + follow-up appointments), DB-backed. */
export const useSchedule = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['schedule'],
    queryFn: () => apiFetch<ScheduleEvent[]>('/api/schedule', { token }),
    enabled: !!token,
  })
}
