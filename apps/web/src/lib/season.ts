const SEASON_MN: Record<string, string> = { fall: 'Намар', winter: 'Өвөл', spring: 'Хавар' }

/** "2026-spring" → "2026 Хавар" — Mongolian season label for admin views. */
export const formatSeason = (id: string) => {
  const [year, s] = id.split('-')
  return `${year} ${SEASON_MN[s] ?? s}`
}
