import type { FindingClass } from '@pinequest/types'

/** Human-friendly Mongolian labels for each detected finding class. */
const LABELS: Record<FindingClass, string> = {
  caries: 'Шүдний цоорол',
  cavity: 'Цоорлын том хөндий',
  crack: 'Шүдний хугарал, гэмтэл',
}

export const findingLabel = (className: string): string =>
  LABELS[className as FindingClass] ?? className
