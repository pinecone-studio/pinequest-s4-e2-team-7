import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { followUpEpisodes, followUpEvents, followUps, type DB } from '@pinequest/db/d1'
import type { TriageLevel, TriageResult } from '@pinequest/types'

const LEVEL_RANK: Record<TriageLevel, number> = { green: 0, yellow: 1, red: 2 }

type Episode = typeof followUpEpisodes.$inferSelect

const emitEvent = (
  db: DB, ep: Episode, from: string | null, to: string, actorId: string, note?: string | null,
) =>
  db.insert(followUpEvents).values({
    episodeId: ep.id, childKey: ep.childKey, seasonId: ep.triggerSeasonId,
    fromStatus: from, toStatus: to, actorId, actorRole: 'system', note: note ?? null,
  })

const closeEp = async (db: DB, ep: Episode, reason: string) => {
  await db.update(followUpEpisodes)
    .set({ closedAt: new Date(), closedReason: reason, status: reason, updatedById: 'system', version: ep.version + 1 })
    .where(eq(followUpEpisodes.id, ep.id))
  await emitEvent(db, ep, ep.status, reason, 'system')
}

/**
 * Open/close the per-child follow-up episode after a screening is persisted.
 * green → close any open episode; yellow/red → supersede + open a new flagged
 * episode (with escalation if a prior one was refused), plus the legacy FollowUp row.
 */
export const syncFollowUpEpisode = async (
  db: DB,
  body: { id: string; childKey: string; schoolId: string; seasonId: string },
  result: TriageResult,
  screenedById: string,
) => {
  const openEp = await db.query.followUpEpisodes.findFirst({
    where: and(eq(followUpEpisodes.childKey, body.childKey), isNull(followUpEpisodes.closedAt)),
  })

  if (result.level === 'green') {
    if (openEp) await closeEp(db, openEp, 'season_cleared')
    return
  }

  const isSameSeason = openEp?.triggerSeasonId === body.seasonId
  if (isSameSeason && openEp) {
    // Lower or equal severity in the same season — keep the existing episode (no-op).
    if (LEVEL_RANK[result.level] <= LEVEL_RANK[openEp.triggerLevel as TriageLevel]) return
    await closeEp(db, openEp, 'superseded')
  } else if (!isSameSeason && openEp) {
    await closeEp(db, openEp, 'superseded')
  }

  // Escalation: a prior episode closed as treatment_refused with a lower score.
  const prevRefused = await db.query.followUpEpisodes.findFirst({
    where: and(
      eq(followUpEpisodes.childKey, body.childKey),
      isNotNull(followUpEpisodes.closedAt),
      eq(followUpEpisodes.closedReason, 'treatment_refused'),
    ),
    orderBy: [desc(followUpEpisodes.updatedAt)],
  })
  const escalation = !!prevRefused && result.score > prevRefused.triggerScore

  const [newEp] = await db.insert(followUpEpisodes).values({
    childKey: body.childKey, schoolId: body.schoolId, triggerSeasonId: body.seasonId,
    triggerScreeningId: body.id, triggerLevel: result.level, triggerScore: result.score,
    status: 'flagged', escalationFlag: escalation, previousEpisodeId: openEp?.id ?? null, updatedById: 'system',
  }).returning()

  await emitEvent(db, newEp, null, 'flagged', 'system', escalation ? 'escalated_after_refusal' : null)

  // Legacy write for backward compat while Phase C rolls out.
  await db.insert(followUps).values({
    childKey: body.childKey, schoolId: body.schoolId, status: 'flagged', updatedById: screenedById, version: 1,
  }).onConflictDoNothing()
}
