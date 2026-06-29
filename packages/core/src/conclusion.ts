import type { DentitionStage, TriageLevel } from '@pinequest/types'

const STAGE_LABEL: Record<DentitionStage, string> = {
  primary: 'сүүн шүдтэй үе',
  mixed: 'холимог шүдтэй үе',
  permanent: 'байнгын шүдтэй үе',
}

const SYMPTOM_LABEL: Record<string, string> = {
  swelling: 'хавдах',
  painDisturbingSleepOrEating: 'нойр, хооллолтыг алдагдуулах өвдөлт',
  fever: 'халуурах',
  gumPimpleOrFistula: 'буйлны буглаа',
  trauma: 'гэмтэл',
}

/** Lead line of the "Дүгнэлт" — conclusion-framed, hedged, never a diagnosis. */
const CONCLUSION_LEAD: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт эмчилгээ шаардлагатай шүд ажиглагдаагүй ба дараагийн хяналтаа үргэлжлүүлээрэй.',
  yellow: 'Зураг болон асуумжид анхаарал шаардсан шинж ажиглагдлаа. Яаралтай биш ч шүдний эмчид үзүүлэхийг зөвлөж байна.',
  red: 'Зураг болон асуумжид нэн анхаарал шаардсан шинж ажиглагдлаа. Яаралтай энэ долоо хоногтоо шүдний эмчид үзүүлнэ үү.',
}

export type ConclusionInput = {
  level: TriageLevel
  flaggedAreas: number
  highConfidence: number
  symptoms: string[]
  ageYears: number
  stage: DentitionStage
}

/**
 * Build the "Дүгнэлт" lines from screening signals (photo findings +
 * questionnaire symptoms + age/stage). Pure: no per-tooth claim, no banned
 * clinical words. Lines only appear when their signal is present.
 */
export const buildConclusion = (i: ConclusionInput): string[] => {
  const lines = [CONCLUSION_LEAD[i.level]]
  if (i.flaggedAreas > 0) {
    const conf = i.highConfidence > 0 ? ` (${i.highConfidence} нь тод харагдаж байна)` : ''
    lines.push(`Шүдний эмчийн үзлэгээр ${i.flaggedAreas} байршлыг зургаас тэмдэглэв${conf}.`)
  }
  if (i.symptoms.length > 0) {
    const named = i.symptoms.map((k) => SYMPTOM_LABEL[k] ?? k).join(', ')
    lines.push(`Асуумжаар шинж тэмдэг тэмдэглэгдсэн: ${named}.`)
  }
  lines.push(`${i.ageYears} настай — ${STAGE_LABEL[i.stage]}.`)
  return lines
}
