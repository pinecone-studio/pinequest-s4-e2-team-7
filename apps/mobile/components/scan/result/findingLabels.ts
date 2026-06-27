import type { FindingClass } from '@pinequest/types'

/** Human-friendly Mongolian labels for each detected finding class. */
const LABELS: Record<FindingClass, string> = {
  caries: 'Цоорол',
  cavity: 'Цооролтот нүх',
  crack: 'Шүдний хагарал',
}

export const findingLabel = (className: string): string =>
  LABELS[className as FindingClass] ?? className
