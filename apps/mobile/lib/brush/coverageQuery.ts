/**
 * Coverage queries — derive per-zone/quadrant/overall progress + status.
 * Mirror of apps/web/src/lib/brush/coverage.ts (query half).
 */

import { ZONE_TARGET_SECONDS } from './config'
import { ZONE_KEYS, type CoverageState, type ZoneKey } from './coverageState'
import { QUADRANTS, SURFACES, type BrushQuadrant, type BrushSurface } from './zones'

export const zoneProgress = (state: CoverageState, key: ZoneKey): number =>
  Math.min(1, (state.seconds[key] ?? 0) / ZONE_TARGET_SECONDS)

export const surfaceProgress = (
  state: CoverageState,
  q: BrushQuadrant,
  s: BrushSurface,
): number => zoneProgress(state, `${q}-${s}` as ZoneKey)

export const quadrantProgress = (state: CoverageState, q: BrushQuadrant): number => {
  const vals = SURFACES.map((s) => surfaceProgress(state, q, s))
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export const overallProgress = (state: CoverageState): number => {
  const vals = ZONE_KEYS.map((k) => zoneProgress(state, k))
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
}

export type ZoneStatus = 'clean' | 'partial' | 'missed'

export const zoneStatus = (progress: number): ZoneStatus => {
  if (progress >= 0.75) return 'clean'
  if (progress >= 0.25) return 'partial'
  return 'missed'
}

export const totalBrushSeconds = (state: CoverageState): number =>
  Object.values(state.seconds).reduce((a, b) => a + b, 0)

export const quadrantSummary = (
  state: CoverageState,
): { quadrant: BrushQuadrant; progress: number }[] =>
  QUADRANTS.map((q) => ({ quadrant: q, progress: quadrantProgress(state, q) }))
