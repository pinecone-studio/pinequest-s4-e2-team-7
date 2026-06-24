import type { BoundingBox, FindingClass, SeasonId, TriageLevel } from './common.js'
import type { ChildKey } from './child.js'

/** A single normalized YOLO detection (camelCase contract). */
export interface InferenceDetection {
  classId: number
  className: FindingClass
  confidence: number
  box: BoundingBox
}

/** Raw inference output, pre-triage. Same shape from server or on-device. */
export interface InferenceResult {
  detections: InferenceDetection[]
  imageWidth: number
  imageHeight: number
  source: 'server' | 'on_device'
}

/** Longitudinal flag for a finding across seasons (child_key × season × FDI). */
export type LongitudinalFlag = 'new' | 'worsened' | 'stable' | 'resolved'

/** Per-tooth finding persisted with a screening (immutable). */
export interface ToothFinding {
  id: string
  /** FDI tooth code (11–48); optional until tooth localization exists. */
  fdi?: number
  className: FindingClass
  classId: number
  confidence: number
  box: BoundingBox
  longitudinal?: LongitudinalFlag
}

/** Screener symptom checklist captured at screening time. */
export interface SymptomSet {
  swelling?: boolean
  painDisturbingSleepOrEating?: boolean
  fever?: boolean
  gumPimpleOrFistula?: boolean
  trauma?: boolean
}

/** Derived triage outcome (computed in @pinequest/core, never by the model). */
export interface TriageResult {
  level: TriageLevel
  /** Continuous risk score that backs the discrete level. */
  score: number
  /** Whether the parent message may use definite (vs hedged) wording. */
  confidentWording: boolean
  reason?: string
}

/**
 * The immutable screening event. Self-contained and valid offline.
 * `id` is a client-generated UUID and doubles as the sync idempotency key.
 */
export interface Screening {
  id: string
  childKey: ChildKey
  classId: string
  schoolId: string
  seasonId: SeasonId
  screenedById: string
  /** Storage keys (synced) or local URIs (offline) for the captured photos. */
  imageRefs: string[]
  findings: ToothFinding[]
  symptoms: SymptomSet
  triage: TriageResult
  modelName: string
  modelVersion?: string
  /** Pinned dentist-approved content version used to render parent text. */
  contentVersionId: string
  /** Device wall-clock time of capture. */
  capturedAt: string
  deviceId?: string
  /** Server receipt time; null until synced up. */
  syncedAt: string | null
}

/** Payload a device sends to persist a screening (no PII — childKey only). */
export type ScreeningCreate = Omit<Screening, 'syncedAt'>
