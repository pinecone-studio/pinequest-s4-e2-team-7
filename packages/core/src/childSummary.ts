import type {
  ChildScreeningSummary,
  DentitionStage,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'
import { buildConclusion } from './conclusion.js'


const HEADLINE: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын шинж тэмдэг илрээгүй. Энэ нь онош биш — хяналтаар үргэлжлүүлээрэй.',
  yellow: 'Шүдний эмчид үзүүлэхийг зөвлөж байна (яаралтай биш).',
  red: 'Аль болох хурдан шүдний эмчид хандахыг зөвлөж байна.',
}

const BASE_STEPS = [
  'Өдөрт 2 удаа фтортой оохойгоор шүдээ угаах.',
  'Чихэрлэг хоол, ундааны хэрэглээг багасгах.',
]

const LEVEL_STEPS: Record<TriageLevel, string[]> = {
  green: ['Дараагийн хяналтын скринингт хамрагдах.'],
  yellow: ['1–2 долоо хоногийн дотор шүдний эмчид үзүүлэх цаг товлох.'],
  red: ['Өвдөлт, хавдар, эсвэл халуурвал яаралтай эмнэлэгт хандах.'],
}

const STAGE_STEP: Record<DentitionStage, string> = {
  primary: 'Бага насны хүүхдэд эцэг эх нь шүд угаахад нь туслах.',
  mixed: 'Шинээр ургаж буй байнгын араа шүдэнд онцгой анхаарах.',
  permanent: 'Шүдний цэвэрлэгээний утас өдөр бүр хэрэглэж эхлэх.',
}

// Dentist-approved at-home care for a non-urgent (yellow) referral. Age-aware.
const YELLOW_HYGIENE = [
  'Шүдээ өдөрт 2 удаа, доод тал нь 2 минут фтортой оохойгоор угаах.',
  'Угаасны дараа амаа усаар зайлахгүй — фтор шүдэнд үлдэж хамгаална.',
  'Хэлээ хойноос урагш зөөлөн шүүрдэж цэвэрлэх (амны эвгүй үнэрээс сэргийлнэ).',
  'Чихэрлэг хоол, ундааны хэрэглээг багасгах.',
]

const YELLOW_STAGE_STEP: Record<DentitionStage, string> = {
  primary: 'Бага насны хүүхдэд эцэг эх нь шүд угаахад нь өдөр бүр туслах.',
  mixed: 'Хатуу хоол (хатуу мах, ааруул) зажилснаар байнгын шүдэнд зай тавигдана. Шинээр ургасан байнгын араанд ховил битүүлэх (sealant) хийлгэхийг эмчээс асуух.',
  permanent: 'Шүд хоорондын зайг өдөр бүр цэвэрлэгээний утсаар цэвэрлэх.',
}

const buildYellowSteps = (stage: DentitionStage, flaggedAreas: number): string[] => {
  const steps = [...YELLOW_HYGIENE, YELLOW_STAGE_STEP[stage]]
  if (flaggedAreas > 0)
    steps.push(`Шүдний эмчид үзүүлэхдээ тэмдэглэгдсэн ${flaggedAreas} хэсгийг шалгуулж эмчлүүлэх.`)
  return steps
}

/**
 * Dentist-approved, age-aware note on the child's dentition stage. PII-free —
 * callers prepend the child's name + age from the roster at the render layer.
 */
export const childDevelopmentNote = (stage: DentitionStage): string =>
  ({
    primary: 'сүүн шүдний үе шат. Сүүн шүдийг сайн арчилснаар ирээдүйн шүдний суурь тавигдана.',
    mixed: 'сүү ба байнгын шүд солигдох үе шат. Ойролцоогоор 13 нас хүртэл сүүн шүд байнгын шүдээр солигдоно — хатуу хоол зажилж, шинээр ургасан араагаа хамгаалах нь чухал.',
    permanent: 'байнгын шүдтэй болсон үе шат. Эдгээр шүд насан туршийнх тул өдөр тутмын арчилгаа онцгой ач холбогдолтой.',
  })[stage]

/** Personalized, PII-free narrative from the child's own screening data. */
export const childSummaryNarrative = (s: ChildScreeningSummary): string => {
  const parts = [`${s.ageYears} настай — ${childDevelopmentNote(s.dentitionStage)}`]
  if (s.flaggedAreas > 0) parts.push(`Энэ удаа шүдний эмчид үзүүлэх ${s.flaggedAreas} хэсэг тэмдэглэгдсэн.`)
  if (s.symptoms.length > 0) parts.push(`Асуумжид анхаарах ${s.symptoms.length} шинж тэмдэг бүртгэгдсэн.`)
  return parts.join(' ')
}

/** Expected dentition stage by age (educational only — not a per-tooth claim). */
export const dentitionStageForAge = (ageYears: number): DentitionStage => {
  if (ageYears < 6) return 'primary'
  if (ageYears <= 12) return 'mixed'
  return 'permanent'
}

const symptomKeys = (s: SymptomSet): string[] =>
  (
    [
      'swelling',
      'painDisturbingSleepOrEating',
      'fever',
      'gumPimpleOrFistula',
      'trauma',
    ] as const
  ).filter((k) => s[k])

type BuildInput = {
  screeningId: string
  seasonId: string
  capturedAt: string
  birthYear: number
  findings: ToothFinding[]
  symptoms: SymptomSet
  aiLevel: TriageLevel
  confidentWording: boolean
  reviewedLevel?: TriageLevel
  /** Capture year (defaults to capturedAt's year). */
  asOfYear?: number
}

/**
 * Build a compliant per-child screening summary. Pure: same output on phone,
 * server, and board. Counts are "areas a dentist should check", never a
 * diagnosis or a decay count.
 */
export const buildChildSummary = (input: BuildInput): ChildScreeningSummary => {
  const effectiveLevel = input.reviewedLevel ?? input.aiLevel
  const year = input.asOfYear ?? new Date(input.capturedAt).getFullYear()
  const ageYears = Math.max(0, year - input.birthYear)
  const stage = dentitionStageForAge(ageYears)

  const flaggedByConfidence = { high: 0, moderate: 0, low: 0 }
  for (const f of input.findings) {
    if (f.confidence >= 0.6) flaggedByConfidence.high += 1
    else if (f.confidence >= 0.45) flaggedByConfidence.moderate += 1
    else flaggedByConfidence.low += 1
  }

  const loci = input.findings
    .map((f) => f.fdi)
    .filter((n): n is number => typeof n === 'number')

  const homeSteps =
    effectiveLevel === 'yellow'
      ? buildYellowSteps(stage, input.findings.length)
      : [...BASE_STEPS, ...LEVEL_STEPS[effectiveLevel], STAGE_STEP[stage]]

  const symptoms = symptomKeys(input.symptoms)
  const conclusion = buildConclusion({
    level: effectiveLevel,
    flaggedAreas: input.findings.length,
    highConfidence: flaggedByConfidence.high,
    symptoms,
    ageYears,
    stage,
  })

  return {
    screeningId: input.screeningId,
    seasonId: input.seasonId,
    capturedAt: input.capturedAt,
    aiLevel: input.aiLevel,
    reviewedLevel: input.reviewedLevel,
    effectiveLevel,
    confidentWording: input.confidentWording,
    flaggedAreas: input.findings.length,
    flaggedByConfidence,
    loci,
    symptoms,
    ageYears,
    dentitionStage: stage,
    headline: HEADLINE[effectiveLevel],
    conclusion,
    homeSteps,
  }
}
