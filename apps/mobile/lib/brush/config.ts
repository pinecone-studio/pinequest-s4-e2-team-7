/** Live brushing tunables — mirror of apps/web/src/lib/brush/config.ts. */

/** Run the recognizer every N incoming IMU frames. */
export const LIVE_STRIDE = 5

/** A label must win this many predictions in a row to become the active zone. */
export const LIVE_MIN_STREAK = 2
export const LIVE_MIN_CONFIDENCE = 0.6

/** deg/s — below this the brush is treated as idle (not moving). */
export const LIVE_IDLE_MAX_GYRO = 12

/** Coverage model: a zone is "done" at this many effective brushing seconds. */
export const ZONE_TARGET_SECONDS = 20
export const SESSION_TARGET_SECONDS = 120

/** Motion gate: scrubbing must exceed this (deg/s) to accrue coverage. */
export const COVERAGE_MIN_GYRO = 25
export const COVERAGE_FULL_GYRO = 220
