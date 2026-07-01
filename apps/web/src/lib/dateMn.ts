// Mongolian date formatting. `toLocaleDateString('mn-MN', { month: 'long' | 'short' })`
// and `weekday` fall back to ENGLISH month/weekday names in most JS runtimes, so we
// format numerically in Mongolian here instead ("7-р сарын 1"). Use these everywhere
// a date is shown to the user.

const two = (n: number) => String(n).padStart(2, '0')
const asDate = (v: Date | string | number) => (v instanceof Date ? v : new Date(v))

/** "2026 оны 7-р сарын 1" */
export const formatDateMn = (v: Date | string | number): string => {
  const d = asDate(v)
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

/** "7-р сарын 1" — compact, no year. */
export const formatDayMonthMn = (v: Date | string | number): string => {
  const d = asDate(v)
  return `${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

/** "7-р сарын 1, 14:30" */
export const formatDateTimeMn = (v: Date | string | number): string => {
  const d = asDate(v)
  return `${formatDayMonthMn(d)}, ${two(d.getHours())}:${two(d.getMinutes())}`
}

/** "2026 оны 7-р сар" — month header. */
export const formatMonthMn = (v: Date | string | number): string => {
  const d = asDate(v)
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сар`
}
