/** Per-tooth ML coverage model — mirror of apps/web/src/lib/brushMl.ts (model). */

import type { BrushQuadrant } from '@/lib/brush/zones'
import {
  SURFACES,
  type BrushMlState,
  type BrushSensorFrame,
  type ToothId,
  type ToothState,
  type ToothSurface,
} from './types'

const ZONE_TO_ARCH: Record<BrushQuadrant, 'upper' | 'lower'> = {
  UL: 'upper', UR: 'upper', LL: 'lower', LR: 'lower',
}
const ZONE_TO_SIDE: Record<BrushQuadrant, 'left' | 'right'> = {
  UL: 'left', UR: 'right', LL: 'left', LR: 'right',
}
const SURFACE_MN: Record<ToothSurface, string> = { outer: 'гадна', inner: 'дотор', occlusal: 'жевхэн' }
const ARCH_MN = { upper: 'Дээд', lower: 'Доод' } as const
const SIDE_MN = { left: 'зүүн', right: 'баруун' } as const

const buildTeeth = (): ToothState[] => {
  const teeth: ToothState[] = []
  for (const arch of ['upper', 'lower'] as const) {
    for (const side of ['left', 'right'] as const) {
      for (let i = 1; i <= 8; i++) {
        const id = `${arch === 'upper' ? 'U' : 'L'}-${side === 'left' ? 'L' : 'R'}${i}` as ToothId
        teeth.push({ id, arch, side, index: i, coverage: 0, surfaces: { outer: 0, inner: 0, occlusal: 0 } })
      }
    }
  }
  return teeth
}

/** Map IMU tilt within a quadrant to a tooth index 1–8 (incisor → molar). */
const toothIndexFromTilt = (tiltDeg: number): number => {
  const t = (Math.max(-45, Math.min(45, tiltDeg)) + 45) / 90
  return Math.min(8, Math.max(1, Math.round(1 + t * 7)))
}

export const resolveActiveTooth = (frame: BrushSensorFrame): ToothId => {
  const prefix = ZONE_TO_ARCH[frame.zone] === 'upper' ? 'U' : 'L'
  const side = ZONE_TO_SIDE[frame.zone] === 'left' ? 'L' : 'R'
  return `${prefix}-${side}${toothIndexFromTilt(frame.tiltDeg)}` as ToothId
}

export const formatZoneLabel = (frame: BrushSensorFrame, toothId: ToothId): string => {
  const arch = ZONE_TO_ARCH[frame.zone]
  const side = ZONE_TO_SIDE[frame.zone]
  const num = toothId.split('-')[1]?.slice(1) ?? '1'
  return `${ARCH_MN[arch]}, ${SIDE_MN[side]}, ${SURFACE_MN[frame.surface]} · #${num}`
}

const recompute = (surfaces: Record<ToothSurface, number>): number =>
  Math.round(SURFACES.reduce((a, s) => a + surfaces[s], 0) / SURFACES.length)

const computeOverall = (teeth: ToothState[]): number =>
  teeth.length ? Math.round(teeth.reduce((sum, t) => sum + t.coverage, 0) / teeth.length) : 0

/** ML coverage update — weights pressure + dwell time per surface. */
export const processSensorFrame = (state: BrushMlState, frame: BrushSensorFrame): BrushMlState => {
  const activeToothId = resolveActiveTooth(frame)
  const pressureFactor = frame.pressure < 0.35 ? 0.4 : frame.pressure > 0.85 ? 0.7 : 1.15
  const delta = 4.5 * pressureFactor

  const teeth = state.teeth.map((tooth) => {
    if (tooth.id !== activeToothId) return tooth
    const surfaces = { ...tooth.surfaces, [frame.surface]: Math.min(100, tooth.surfaces[frame.surface] + delta) }
    return { ...tooth, surfaces, coverage: recompute(surfaces) }
  })

  return { teeth, activeToothId, zoneLabel: formatZoneLabel(frame, activeToothId), overallCoverage: computeOverall(teeth) }
}

export const createBrushMlState = (): BrushMlState => {
  const teeth = buildTeeth()
  return { teeth, activeToothId: null, zoneLabel: 'Сойзоо асаагаад эхлүүлнэ үү', overallCoverage: 0 }
}
