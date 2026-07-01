import { and, eq, isNull } from 'drizzle-orm'
import { followUpEpisodes, followUpEvents, type DB } from '@pinequest/db/d1'
import type { DentistVerdict } from '@pinequest/types'

/**
 * Dentist finish-call coupling. When the appointed dentist ends the video call and
 * records a verdict — 'treatment_needed' (Эмчилгээ хийлгэх) or 'postponed'
 * (Хойшлуулсан) — close the child's OPEN follow-up episode with that verdict and
 * emit an audited FollowUpEvent.
 *
 * SYSTEM transition: reachable only from the dentist/admin appointment route, so
 * teachers/parents can never set the verdict. No-op when there's no open episode.
 */
export const recordDentistVerdict = async (
  db: DB,
  childKey: string,
  actorId: string,
  actorRole: string,
  note: string,
  verdict: DentistVerdict,
): Promise<void> => {
  const ep = await db.query.followUpEpisodes.findFirst({
    where: and(eq(followUpEpisodes.childKey, childKey), isNull(followUpEpisodes.closedAt)),
  })
  if (!ep) return

  await db
    .update(followUpEpisodes)
    .set({
      status: verdict,
      notes: note || ep.notes,
      closedAt: new Date(),
      closedReason: verdict,
      updatedById: actorId,
      version: ep.version + 1,
    })
    .where(eq(followUpEpisodes.id, ep.id))

  await db.insert(followUpEvents).values({
    episodeId: ep.id,
    childKey,
    seasonId: ep.triggerSeasonId,
    fromStatus: ep.status,
    toStatus: verdict,
    actorId,
    actorRole,
    note: note || null,
  })
}
