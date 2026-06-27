import { useQuery } from '@tanstack/react-query'
import type { ChildScreeningSummary } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type PainOnset = 'yesterday' | '2_3_days' | '5_plus_days'

export type QuestionnaireAnswers = {
  swelling: boolean
  painDisturbingSleepOrEating: boolean
  fever: boolean
  gumPimpleOrFistula: boolean
  trauma: boolean
  bleedingGums: boolean | null
  painPresent: boolean
  painCold: boolean
  painHot: boolean
  painBiting: boolean
  painSpontaneous: boolean
  painNight: boolean
  painOnset: PainOnset | null
}

export type HospitalGuide = {
  name: string
  address: string
  distanceKm: number
  travelMinutes: number
  schedule: string
  phone: string
}

export type ChildSummaryPayload = {
  child: {
    id: string
    firstName: string
    lastName: string
    birthYear: number
    gender: string | null
    guardianPhone: string | null
    guardianEmail: string | null
  }
  summary: ChildScreeningSummary | null
  screeningCount: number
  imageRefs: string[]
  questionnaire: QuestionnaireAnswers | null
  hospital: HospitalGuide | null
}

export const useChildSummary = (childId: string | null) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['child-summary', childId],
    queryFn: () => apiFetch<ChildSummaryPayload>(`/api/children/${childId}/summary`, { token }),
    enabled: !!token && !!childId,
  })
}
