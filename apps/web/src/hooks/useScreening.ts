import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TriageLevel } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

type Finding = { id: string; fdi: number | null; className: string; confidence: number }
type ScreeningImage = { id: string; ref: string; order: number }
export type Questionnaire = {
  isAdult: boolean
  swelling: boolean | null
  painDisturbingSleepOrEating: boolean | null
  fever: boolean | null
  gumPimpleOrFistula: boolean | null
  trauma: boolean | null
  bleedingGums: boolean | null
  smoker: boolean | null
  lastCheckupAdult: string | null
} | null

export type ScreeningDetail = {
  id: string
  childKey: string
  seasonId: string
  triageLevel: TriageLevel
  triageReason: string | null
  capturedAt: string
  modelName: string
  findings: Finding[]
  images: ScreeningImage[]
  questionnaire: Questionnaire
  review: { confirmedLevel: string; note: string | null } | null
}

export type QueueRow = {
  id: string
  childKey: string
  seasonId: string
  triageLevel: TriageLevel
  capturedAt: string
  review: { confirmedLevel: string } | null // null = still awaiting dentist confirm
}

export const useReviewQueue = (seasonId?: string) => {
  const { token } = useSession()
  const qs = seasonId ? `?seasonId=${seasonId}` : ''
  return useQuery({
    queryKey: ['review-queue', seasonId ?? 'all'],
    queryFn: () => apiFetch<QueueRow[]>(`/api/screenings${qs}`, { token }),
    enabled: !!token,
  })
}

export const useScreening = (id: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['screening', id],
    queryFn: () => apiFetch<ScreeningDetail>(`/api/screenings/${id}`, { token }),
    enabled: !!token && !!id,
  })
}

export const useSubmitReview = (id: string) => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { confirmedLevel: string; note?: string }) =>
      apiFetch(`/api/screenings/${id}/review`, { token, method: 'PUT', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['screening', id] })
      qc.invalidateQueries({ queryKey: ['review-queue'] }) // reviewed item leaves the queue
      qc.invalidateQueries({ queryKey: ['screenings'] })
    },
  })
}
