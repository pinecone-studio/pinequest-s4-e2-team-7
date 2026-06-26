/** Triage state shown to the screener; the single loudest UI element. */
export type TriageLevel = 'green' | 'yellow' | 'red'

/** Disease classes emitted by the YOLO model (generic "tooth" detections excluded). */
export type FindingClass = 'caries' | 'cavity' | 'crack'

/** Follow-up lifecycle — the only mutable state in the system. */
export type FollowUpStatus =
  | 'flagged'
  | 'contacted'
  | 'doctor_connected'
  | 'treatment_done'
  | 'treatment_refused'
  | 'unclear'

/** Screening period, e.g. "2026-spring". One leg of the identity triple. */
export type SeasonId = string

/** Pixel bounding box in the original captured image. */
export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}
