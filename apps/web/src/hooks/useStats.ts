import { useQuery } from '@tanstack/react-query'
import { apiStatFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type DashStats = {
  totalScreened: number
  triage: { green: number; yellow: number; red: number }
  coverage: { screened: number; total: number }
  pendingReview: number
  flaggedFollowUps: number
  resolvedFollowUps: number
}

export type TsBucket = { ts: string; screened: number; flagged: number }
export type Timeseries = { range: string; buckets: TsBucket[] }

export const useStats = (opts: { seasonId?: string; schoolId?: string } = {}) => {
  const { token } = useSession()
  const qs = new URLSearchParams(
    Object.entries(opts).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString()
  return useQuery({
    queryKey: ['stats', opts],
    // no-store + polling: mobile синк хийсний дараа триаж тоо/хамрагдалт шинэчлэгдэнэ.
    queryFn: () => apiStatFetch<DashStats>(`/api/stats${qs ? `?${qs}` : ''}`, { token }),
    enabled: !!token,
    refetchInterval: 10_000,
  })
}

/** Screened-vs-Flagged buckets for the activity chart + monthly hero. */
export const useTimeseries = (range: string, seasonId?: string) => {
  const { token } = useSession()
  const qs = new URLSearchParams({ range, ...(seasonId ? { seasonId } : {}) }).toString()
  return useQuery({
    queryKey: ['timeseries', range, seasonId ?? 'all'],
    queryFn: () => apiStatFetch<Timeseries>(`/api/stats/timeseries?${qs}`, { token }),
    enabled: !!token,
    refetchInterval: 10_000,
  })
}
