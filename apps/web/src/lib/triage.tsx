import { ExclamationTriangleIcon, ExclamationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'
import type { ComponentType, SVGProps } from 'react'
import type { TriageLevel } from '@pinequest/types'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

/**
 * The ONE canonical triage vocabulary for the whole board. Every status label,
 * colour, and icon resolves here — components must NOT redefine their own maps,
 * so red/yellow/green always read and look identical everywhere.
 */
export const TRIAGE_LABEL: Record<TriageLevel, string> = {
  red: 'Яаралтай эмчилгээ шаардлагатай',
  yellow: 'Эмчилгээ шаардлагатай',
  green: 'Харьцангуй эрүүл',
}

/** Compact form for tight spots — table cells, chart axes, small pills. */
export const TRIAGE_SHORT: Record<TriageLevel, string> = {
  red: 'Яаралтай',
  yellow: 'Эмчилгээ',
  green: 'Эрүүл',
}

export const TRIAGE_TEXT: Record<TriageLevel, string> = {
  red: 'text-triage-red',
  yellow: 'text-triage-yellow',
  green: 'text-triage-green',
}

export const TRIAGE_DOT: Record<TriageLevel, string> = {
  red: 'bg-triage-red',
  yellow: 'bg-triage-yellow',
  green: 'bg-triage-green',
}

/** Soft tinted background — avatar squares, chips, badges. */
export const TRIAGE_SOFT: Record<TriageLevel, string> = {
  red: 'bg-triage-red-bg',
  yellow: 'bg-triage-yellow-bg',
  green: 'bg-triage-green-bg',
}

export const TRIAGE_ICON: Record<TriageLevel, IconType> = {
  red: ExclamationTriangleIcon,
  yellow: ExclamationCircleIcon,
  green: ShieldCheckIcon,
}

/** Not-yet-screened bucket shown alongside the three real levels. */
export const TRIAGE_NONE = {
  label: 'Шалгаагүй',
  text: 'text-text-muted',
  dot: 'bg-border',
  soft: 'bg-surface-raised',
  Icon: ExclamationCircleIcon as IconType,
}
