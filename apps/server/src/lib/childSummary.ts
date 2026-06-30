import { eq, desc, count, asc } from 'drizzle-orm'
import { buildChildSummary } from '@pinequest/core'
import { children, screenings, screeningImages, type DB } from '@pinequest/db/d1'
import type {
  ChildScreeningSummary,
  FindingClass,
  QuestionnaireAnswer,
  ScreeningGuidance,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'

export type QuestionnaireAnswers = {
  swelling: boolean
  painDisturbingSleepOrEating: boolean
  fever: boolean
  gumPimpleOrFistula: boolean
  trauma: boolean
  bleedingGums: boolean | null
}

/** Roster-side child fields the board may show (PII stays server-scoped). */
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
  /** Literal questionnaire Q&A exactly as asked on the device (verbatim). */
  questionnaireRaw: QuestionnaireAnswer[] | null
  /** Gemini parent advice produced at capture (same text shown on the phone). */
  advice: string | null
  /** Gemini age-aware guidance produced at capture (same as the phone). */
  guidance: ScreeningGuidance | null
  hospital: null
}

/** Parse the stored verbatim questionnaire JSON (`{q,a}[]`), tolerating junk. */
const parseRawAnswers = (raw: string | null | undefined): QuestionnaireAnswer[] | null => {
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return null
    const ok = arr.filter(
      (x): x is QuestionnaireAnswer =>
        !!x && typeof x.q === 'string' && typeof x.a === 'string',
    )
    return ok.length ? ok : null
  } catch {
    return null
  }
}

const toFinding = (f: {
  id: string; fdi: number | null; className: string; classId: number
  confidence: number; boxX1: number; boxY1: number; boxX2: number; boxY2: number
}): ToothFinding => ({
  id: f.id,
  fdi: f.fdi ?? undefined,
  className: f.className as FindingClass,
  classId: f.classId,
  confidence: f.confidence,
  box: { x1: f.boxX1, y1: f.boxY1, x2: f.boxX2, y2: f.boxY2 },
})

const toSymptoms = (q: {
  swelling: boolean | null; painDisturbingSleepOrEating: boolean | null
  fever: boolean | null; gumPimpleOrFistula: boolean | null; trauma: boolean | null
} | null | undefined): SymptomSet => ({
  swelling: q?.swelling ?? false,
  painDisturbingSleepOrEating: q?.painDisturbingSleepOrEating ?? false,
  fever: q?.fever ?? false,
  gumPimpleOrFistula: q?.gumPimpleOrFistula ?? false,
  trauma: q?.trauma ?? false,
})

export const loadChildSummary = async (db: DB, id: string): Promise<ChildSummaryPayload | null> => {
  const child = await db.query.children.findFirst({ where: eq(children.id, id) })
  if (!child) return null

  const [latest, cnt] = await Promise.all([
    db.query.screenings.findFirst({
      where: eq(screenings.childKey, child.childKey),
      orderBy: desc(screenings.capturedAt),
      with: { findings: true, questionnaire: true, review: true, summary: true, images: { orderBy: asc(screeningImages.order) } },
    }),
    db.select({ c: count() }).from(screenings).where(eq(screenings.childKey, child.childKey)),
  ])

  const summary = latest
    ? buildChildSummary({
        screeningId: latest.id,
        seasonId: latest.seasonId,
        capturedAt: latest.capturedAt.toISOString(),
        birthYear: child.birthYear,
        findings: latest.findings.map(toFinding),
        symptoms: toSymptoms(latest.questionnaire),
        aiLevel: latest.triageLevel as TriageLevel,
        confidentWording: latest.triageConfidentWording,
        reviewedLevel: (latest.review?.confirmedLevel as TriageLevel | undefined) ?? undefined,
      })
    : null

  return {
    child: {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthYear: child.birthYear,
      gender: child.gender,
      guardianPhone: child.guardianPhone,
      guardianEmail: child.guardianEmail,
    },
    summary,
    screeningCount: cnt[0]?.c ?? 0,
    imageRefs: latest?.images?.map((i) => i.ref) ?? [],
    questionnaire: latest?.questionnaire
      ? {
          swelling: latest.questionnaire.swelling ?? false,
          painDisturbingSleepOrEating: latest.questionnaire.painDisturbingSleepOrEating ?? false,
          fever: latest.questionnaire.fever ?? false,
          gumPimpleOrFistula: latest.questionnaire.gumPimpleOrFistula ?? false,
          trauma: latest.questionnaire.trauma ?? false,
          bleedingGums: latest.questionnaire.bleedingGums ?? null,
        }
      : null,
    questionnaireRaw: parseRawAnswers(latest?.questionnaire?.rawAnswers),
    advice: latest?.summary?.advice ?? null,
    guidance: latest?.summary
      ? {
          homeCare: latest.summary.homeCare ?? '',
          brushing: latest.summary.brushing ?? '',
          diet: latest.summary.diet ?? '',
          prevention: latest.summary.prevention ?? '',
          nextStep: latest.summary.nextStep ?? '',
        }
      : null,
    hospital: null,
  }
}
