import { and, desc, eq, inArray, isNotNull, ne, or, sql } from 'drizzle-orm'
import { children, type DB } from '@pinequest/db/d1'

/** A reliable guardian identifier for matching the same child across classes/schools. */
export type TransferMatchInput = {
  birthYear: number
  guardianEmail?: string | null
  guardianPhone?: string | null
  excludeClassId: string
}

/**
 * The childKey of the same child's most recent prior record in a DIFFERENT class,
 * matched by a RELIABLE identifier — guardian email/phone + birth year — never by
 * name (names repeat; a guardian contact is unique per family). Returns null when no
 * reliable identifier is given or no match is found. Searches across all schools.
 */
export const findPreviousChildKey = async (db: DB, input: TransferMatchInput): Promise<string | null> => {
  const email = input.guardianEmail?.trim().toLowerCase() || null
  const phone = input.guardianPhone?.trim() || null
  if (!email && !phone) return null

  const contact = [
    email ? eq(sql`lower(${children.guardianEmail})`, email) : undefined,
    phone ? eq(children.guardianPhone, phone) : undefined,
  ].filter(Boolean)

  const [match] = await db
    .select({ childKey: children.childKey })
    .from(children)
    .where(and(eq(children.birthYear, input.birthYear), ne(children.classId, input.excludeClassId), or(...contact)))
    .orderBy(desc(children.createdAt))
    .limit(1)
  return match?.childKey ?? null
}

/**
 * Walk `previousChildKey` links up to `maxDepth` levels and return every ancestor
 * childKey reachable from the given starting keys — a child's transfer lineage, so
 * their screening history follows them across classes/schools. Cycle-safe.
 */
export const collectAncestorKeys = async (db: DB, startKeys: string[], maxDepth = 5): Promise<string[]> => {
  const seen = new Set<string>()
  let frontier = [...new Set(startKeys.filter((k): k is string => !!k))]
  for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
    frontier.forEach((k) => seen.add(k))
    const rows = await db
      .select({ prev: children.previousChildKey })
      .from(children)
      .where(and(inArray(children.childKey, frontier), isNotNull(children.previousChildKey)))
    frontier = [...new Set(rows.map((r) => r.prev).filter((p): p is string => !!p && !seen.has(p)))]
  }
  return [...seen]
}
