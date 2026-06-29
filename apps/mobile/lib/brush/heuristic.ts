/**
 * Orientation heuristic — deterministic zone classifier from IMU orientation.
 * Mirror of apps/web/src/lib/brush/heuristic.ts. Drives the live monitor on
 * mobile (no on-device model yet). Keep it simple and explainable.
 */

import {
  IDENTITY_QUAT,
  quatConjugate,
  quatFromInput,
  quatMul,
  yawOfQuat,
  type ImuFrameInput,
  type Quat,
} from './quat'
import { LIVE_IDLE_MAX_GYRO } from './config'
import { IDLE_LABEL, type BrushLabel, type BrushSurface } from './zones'

const RAD2DEG = 180 / Math.PI

const relativeYawDeg = (s: ImuFrameInput, ref: Quat): number => {
  const rel = quatMul(quatConjugate(ref), quatFromInput(s))
  return yawOfQuat(rel) * RAD2DEG
}

const surfaceFromRoll = (rollDeg: number): BrushSurface => {
  const r = Math.abs(rollDeg)
  if (r < 35) return 'occlusal' // brush laid flat on the chewing surface
  return rollDeg > 0 ? 'outer' : 'inner'
}

export const classifyHeuristic = (
  s: ImuFrameInput,
  refQuat: Quat = IDENTITY_QUAT,
  gyroMag = 0,
): BrushLabel => {
  if (gyroMag > 0 && gyroMag < LIVE_IDLE_MAX_GYRO) return IDLE_LABEL

  const upper = s.pitch >= 0
  const left = relativeYawDeg(s, refQuat) <= 0
  const quadrant = upper ? (left ? 'UL' : 'UR') : left ? 'LL' : 'LR'
  return `${quadrant}-${surfaceFromRoll(s.roll)}` as BrushLabel
}
