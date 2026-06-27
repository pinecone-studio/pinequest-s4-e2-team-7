import { useQuery } from '@tanstack/react-query'
import type { ChildTrendSnapshot, TriageLevel, FindingClass, LongitudinalFlag } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type ChildSeasonDetail = {
  seasonId: string
  screeningId: string
  aiLevel: TriageLevel
  triageScore: number | null
  confirmedLevel: TriageLevel | null
  effectiveLevel: TriageLevel
  capturedAt: string
  flaggedAreas: number
  delta: 'improved' | 'worsened' | 'stable' | null
  findings: Array<{
    fdi: number | null
    className: FindingClass
    confidence: number
    longitudinal: LongitudinalFlag | null
  }>
  imageRefs: string[]
}

export type ChildHistoryPayload = {
  childKey: string
  seasons: ChildSeasonDetail[]
  trend: ChildTrendSnapshot | null
  toothTimeline: unknown[]
}

/** Lazy hook — only fetches when enabled=true (i.e. History tab is active). staleTime 5 min. */
export const useChildHistory = (childKey: string | null, enabled = true) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['child-history', childKey],
    queryFn: () => apiFetch<ChildHistoryPayload>(`/api/children/by-key/${childKey}/history`, { token }),
    enabled: !!token && !!childKey && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
