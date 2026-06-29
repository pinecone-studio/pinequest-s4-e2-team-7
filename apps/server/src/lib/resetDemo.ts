import {
  auditLogs, followUpEvents, followUpEpisodes, followUps,
  toothFindings, screeningReviews, screeningImages, questionnaires,
  screenings, parentChildLinks, children, type DB,
} from '@pinequest/db/d1'

// Wipes per-child screening/follow-up demo data so a reseed yields the clean
// 3-per-status set. Preserves auth/config (users, schools, classes, seasons),
// which runSeed re-creates idempotently. Dev-only — gated by SEED_ENABLED.
// Deleted leaf→root; D1 has no enforced FKs, but order keeps intent clear.
export const resetDemo = async (db: DB) => {
  await db.delete(auditLogs)
  await db.delete(followUpEvents)
  await db.delete(followUpEpisodes)
  await db.delete(followUps)
  await db.delete(toothFindings)
  await db.delete(screeningReviews)
  await db.delete(screeningImages)
  await db.delete(questionnaires)
  await db.delete(screenings)
  await db.delete(parentChildLinks)
  await db.delete(children)
}
