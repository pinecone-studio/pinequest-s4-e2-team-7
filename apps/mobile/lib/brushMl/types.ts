/** Per-tooth ML coverage types — mirror of apps/web/src/lib/brushMl.ts (types). */

import type { BrushQuadrant } from '@/lib/brush/zones'

export type ToothSurface = 'outer' | 'inner' | 'occlusal'

/** Sensor frame derived from the IMU (orientation → zone/surface/tilt). */
export type BrushSensorFrame = {
  timestamp: number
  zone: BrushQuadrant
  surface: ToothSurface
  pressure: number
  tiltDeg: number
}

export type ToothId = `${'U' | 'L'}-${'L' | 'R'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

export type ToothState = {
  id: ToothId
  arch: 'upper' | 'lower'
  side: 'left' | 'right'
  index: number
  coverage: number
  surfaces: Record<ToothSurface, number>
}

export type BrushMlState = {
  teeth: ToothState[]
  activeToothId: ToothId | null
  zoneLabel: string
  overallCoverage: number
}

export const SURFACES: ToothSurface[] = ['outer', 'inner', 'occlusal']
