/**
 * Formal Mongolian short name for display: the family (father's) name reduced to
 * its first letter + '.', joined directly to the full given name — e.g.
 * { lastName: 'Болд', firstName: 'Бат' } → 'Б.Бат'. Degrades gracefully when a
 * part is missing (returns whichever part is present).
 *
 * PII stays in the roster; this only formats names already cleared for display.
 */
export const formatChildName = (child: {
  firstName?: string | null
  lastName?: string | null
}): string => {
  const first = (child.firstName ?? '').trim()
  const last = (child.lastName ?? '').trim()
  if (!last) return first
  if (!first) return last
  return `${last.charAt(0).toUpperCase()}.${first}`
}
