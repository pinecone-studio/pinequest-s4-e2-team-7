import { useQuery } from '@tanstack/react-query'
import type { ChildScreeningSummary, QuestionnaireAnswer, ScreeningGuidance } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type QuestionnaireAnswers = {
  swelling: boolean
  painDisturbingSleepOrEating: boolean
  fever: boolean
  gumPimpleOrFistula: boolean
  trauma: boolean
  bleedingGums: boolean | null
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
  /** Literal questionnaire Q&A exactly as asked on the phone (verbatim). */
  questionnaireRaw: QuestionnaireAnswer[] | null
  /** Gemini parent advice produced at capture (same text shown on the phone). */
  advice: string | null
  /** Gemini age-aware guidance produced at capture (same as the phone). */
  guidance: ScreeningGuidance | null
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
