import type { FindingClass } from '@pinequest/types'

/** Human-friendly Mongolian labels for each detected finding class. */
const LABELS: Record<FindingClass, string> = {
  caries: 'Шүдний цоорол',
  cavity: 'Шүдний цоорлын хөндийтэй',
  crack: 'Шүдний паалангийн цуурал,гэмтэл',
}

export const findingLabel = (className: string): string =>
  LABELS[className as FindingClass] ?? className
