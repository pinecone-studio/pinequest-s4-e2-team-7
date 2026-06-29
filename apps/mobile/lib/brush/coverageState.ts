/**
 * Coverage state — per-zone effective brushing seconds, motion-gated.
 * Holding the brush still does NOT accrue coverage; you must scrub.
 * Mirror of apps/web/src/lib/brush/coverage.ts (state half).
 */

import { COVERAGE_FULL_GYRO, COVERAGE_MIN_GYRO } from './config'
import { BRUSH_LABELS, IDLE_LABEL, parseBrushLabel, type BrushLabel } from './zones'

export type ZoneKey = Exclude<BrushLabel, typeof IDLE_LABEL>
export type CoverageMap = Record<string, number>

export type CoverageState = {
  seconds: CoverageMap
  activeZone: ZoneKey | null
  lastUpdate: number
}

export const ZONE_KEYS: ZoneKey[] = BRUSH_LABELS.filter(
  (l): l is ZoneKey => l !== IDLE_LABEL,
)

const zeroMap = (): CoverageMap =>
  Object.fromEntries(ZONE_KEYS.map((k) => [k, 0])) as CoverageMap

export const createCoverageState = (saved?: CoverageMap): CoverageState => ({
  seconds: { ...zeroMap(), ...(saved ?? {}) },
  activeZone: null,
  lastUpdate: 0,
})

/** Map scrubbing intensity (deg/s) to a [0..1] credit multiplier. */
export const motionCredit = (gyroMag: number): number => {
  if (gyroMag < COVERAGE_MIN_GYRO) return 0
  if (gyroMag >= COVERAGE_FULL_GYRO) return 1
  return (gyroMag - COVERAGE_MIN_GYRO) / (COVERAGE_FULL_GYRO - COVERAGE_MIN_GYRO)
}

/** Advance coverage by `dtSec` given the current predicted label + scrubbing. */
export const advanceCoverage = (
  state: CoverageState,
  label: string,
  gyroMag: number,
  dtSec: number,
  now: number,
): CoverageState => {
  const parsed = parseBrushLabel(label)
  if (!parsed || dtSec <= 0 || dtSec > 1) {
    return { ...state, activeZone: parsed ? (label as ZoneKey) : null, lastUpdate: now }
  }
  const credit = motionCredit(gyroMag)
  if (credit <= 0) {
    return { ...state, activeZone: label as ZoneKey, lastUpdate: now }
  }
  const key = label as ZoneKey
  const next = { ...state.seconds }
  next[key] = (next[key] ?? 0) + dtSec * credit
  return { seconds: next, activeZone: key, lastUpdate: now }
}
