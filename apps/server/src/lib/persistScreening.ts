import { and, desc, eq, lt } from 'drizzle-orm'
import {
  screenings, toothFindings, screeningImages, questionnaires, screeningSummaries, type DB,
} from '@pinequest/db/d1'
import type { FindingClass, ScreeningGuidance, SymptomSet, ToothFinding, TriageResult } from '@pinequest/types'
import { computeToothLongitudinal } from '@pinequest/core'
import { syncFollowUpEpisode } from './followUpEpisode.js'

export type PersistInput = {
  id: string
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  imageRefs: string[]
  /** Base64 JPEG bytes per image (parallel to imageRefs) — persisted in the DB. */
  imageData?: string[]
  findings: ToothFinding[]
  symptoms: SymptomSet
  /** AI summary (dentist-voice advice + age-aware guidance) to persist, if any. */
  summary?: { advice: string; guidance?: ScreeningGuidance }
  modelName: string
  modelVersion?: string
  capturedAt: string
  deviceId?: string
}

const withChildren = { with: { findings: true, images: true, questionnaire: true } } as const

export const persistScreening = async (
  db: DB,
  body: PersistInput,
  result: TriageResult,
  screenedById: string,
) => {
  // Idempotent on the client-generated UUID — a re-synced capture is a no-op.
  const existing = await db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
  if (existing) return existing

  const capturedAtDate = new Date(body.capturedAt)

  // Server-side longitudinal: compare against prior season's findings for this child.
  const priorRows = await db
    .select({ fdi: toothFindings.fdi, className: toothFindings.className })
    .from(toothFindings)
    .innerJoin(screenings, eq(screenings.id, toothFindings.screeningId))
    .where(and(eq(screenings.childKey, body.childKey), lt(screenings.capturedAt, capturedAtDate)))
    .orderBy(desc(screenings.capturedAt))
    .limit(100)
  const priorFindings = priorRows.map((r) => ({
    fdi: r.fdi ?? undefined,
    className: r.className as FindingClass,
  }))

  // Immutable screening event.
  await db.insert(screenings).values({
    id: body.id,
    childKey: body.childKey,
    classId: body.classId,
    schoolId: body.schoolId,
    seasonId: body.seasonId,
    screenedById,
    triageLevel: result.level,
    triageScore: result.score,
    triageConfidentWording: result.confidentWording,
    triageReason: result.reason ?? null,
    modelName: body.modelName,
    modelVersion: body.modelVersion ?? null,
    capturedAt: capturedAtDate,
    deviceId: body.deviceId ?? null,
    syncedAt: new Date(),
  })

  if (body.findings.length) {
    await db.insert(toothFindings).values(body.findings.map((f) => ({
      id: f.id,
      screeningId: body.id,
      fdi: f.fdi ?? null,
      className: f.className,
      classId: f.classId,
      confidence: f.confidence,
      boxX1: f.box.x1, boxY1: f.box.y1, boxX2: f.box.x2, boxY2: f.box.y2,
      longitudinal: computeToothLongitudinal(
        { fdi: f.fdi, className: f.className }, priorFindings,
      ),
    })))
  }
  if (body.imageRefs.length) {
    await db.insert(screeningImages).values(body.imageRefs.map((ref, order) => ({
      screeningId: body.id, ref, order, data: body.imageData?.[order] ?? null,
    })))
  }
  await db.insert(questionnaires).values({
    screeningId: body.id,
    swelling: body.symptoms.swelling ?? null,
    painDisturbingSleepOrEating: body.symptoms.painDisturbingSleepOrEating ?? null,
    fever: body.symptoms.fever ?? null,
    gumPimpleOrFistula: body.symptoms.gumPimpleOrFistula ?? null,
    trauma: body.symptoms.trauma ?? null,
  })

  // AI summary (advice + age-aware guidance) — reviewable later, not just at capture.
  if (body.summary) {
    const g = body.summary.guidance
    await db.insert(screeningSummaries).values({
      screeningId: body.id,
      advice: body.summary.advice,
      homeCare: g?.homeCare ?? null,
      brushing: g?.brushing ?? null,
      diet: g?.diet ?? null,
      prevention: g?.prevention ?? null,
      nextStep: g?.nextStep ?? null,
    }).onConflictDoNothing()
  }

  // Open/close the follow-up episode (extracted lifecycle logic).
  await syncFollowUpEpisode(db, body, result, screenedById)

  return db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
}
