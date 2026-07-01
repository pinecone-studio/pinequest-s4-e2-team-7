/**
 * Mongolian display name: the parent (family) name shortened to its first letter
 * plus a dot, then the child's given name — e.g. ("Норовсүрэн", "Энх") → "Н.Энх".
 * Falls back to whichever part exists.
 */
export const shortChildName = (lastName?: string | null, firstName?: string | null): string => {
  const last = (lastName ?? '').trim()
  const first = (firstName ?? '').trim()
  if (last && first) return `${last[0]}.${first}`
  return first || last || ''
}

/** Same, but for a single "{lastName} {firstName}" string (e.g. the history list). */
export const shortChildNameFromFull = (full?: string | null): string => {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}.${parts.slice(1).join(' ')}`
  return parts[0] ?? ''
}
