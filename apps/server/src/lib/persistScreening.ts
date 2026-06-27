import { eq } from 'drizzle-orm'
import { screenings, toothFindings, screeningImages, questionnaires, followUps, type DB } from '@pinequest/db/d1'
import type { SymptomSet, ToothFinding, TriageResult } from '@pinequest/types'

export type PersistInput = {
  id: string
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  imageRefs: string[]
  findings: ToothFinding[]
  symptoms: SymptomSet
  modelName: string
  modelVersion?: string
  capturedAt: string
  deviceId?: string
}

const withChildren = {
  with: { findings: true, images: true, questionnaire: true },
} as const

export const persistScreening = async (
  db: DB,
  body: PersistInput,
  result: TriageResult,
  screenedById: string,
) => {
  // Idempotent on the client-generated UUID — a re-synced capture is a no-op.
  const existing = await db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
  if (existing) return existing

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
    capturedAt: new Date(body.capturedAt),
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
      boxX1: f.box.x1,
      boxY1: f.box.y1,
      boxX2: f.box.x2,
      boxY2: f.box.y2,
      longitudinal: f.longitudinal ?? null,
    })))
  }
  if (body.imageRefs.length) {
    await db.insert(screeningImages).values(body.imageRefs.map((ref, order) => ({ screeningId: body.id, ref, order })))
  }
  await db.insert(questionnaires).values({
    screeningId: body.id,
    swelling: body.symptoms.swelling ?? null,
    painDisturbingSleepOrEating: body.symptoms.painDisturbingSleepOrEating ?? null,
    fever: body.symptoms.fever ?? null,
    gumPimpleOrFistula: body.symptoms.gumPimpleOrFistula ?? null,
    trauma: body.symptoms.trauma ?? null,
  })

  if (result.level !== 'green') {
    await db.insert(followUps).values({
      childKey: body.childKey,
      schoolId: body.schoolId,
      status: 'flagged',
      updatedById: screenedById,
      version: 1,
    }).onConflictDoNothing()
  }

  return db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
}
