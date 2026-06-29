import type { BoardStudent } from '@/hooks/useBoard'

// Re-scope each board student to a single season: swap the all-time latest triage
// for that season's screening snapshot (level + ids + date). Children not screened
// in the season become latestLevel=null — i.e. "not screened" — unless dropUnscreened
// is set, in which case they are removed entirely (worklists that only want flagged kids).
export const scopeStudentsToSeason = (
  students: readonly BoardStudent[] | undefined,
  seasonId: string | undefined,
  dropUnscreened = false,
): BoardStudent[] => {
  if (!students) return []
  if (!seasonId) return dropUnscreened ? [] : [...students]

  const out: BoardStudent[] = []
  for (const s of students) {
    const snap = s.seasonHistory.find((h) => h.seasonId === seasonId)
    if (snap) {
      out.push({ ...s, latestLevel: snap.effectiveLevel, latestScreeningId: snap.screeningId, screenedAt: snap.screenedAt })
    } else if (!dropUnscreened) {
      out.push({ ...s, latestLevel: null, latestScreeningId: null, screenedAt: null })
    }
  }
  return out
}
