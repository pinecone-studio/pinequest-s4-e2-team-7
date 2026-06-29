/**
 * Quaternion math + IMU frame input — the bits the heuristic recognizer needs.
 * Subset of apps/web/src/lib/brush/featureContract.ts. Pure, no platform imports.
 */

export type Quat = { w: number; x: number; y: number; z: number }
export type Vec3 = { x: number; y: number; z: number }

/** Minimal IMU sample. Compatible with Mpu6050Sample. */
export type ImuFrameInput = {
  quaternion?: Quat
  yaw: number
  pitch: number
  roll: number
  gyro?: Vec3
  accel?: Vec3
}

const DEG2RAD = Math.PI / 180

export const IDENTITY_QUAT: Quat = { w: 1, x: 0, y: 0, z: 0 }

export const normalizeQuat = (q: Quat): Quat => {
  const len = Math.hypot(q.w, q.x, q.y, q.z)
  if (len < 1e-8) return { w: 1, x: 0, y: 0, z: 0 }
  const s = q.w < 0 ? -1 / len : 1 / len // canonical w >= 0
  return { w: q.w * s, x: q.x * s, y: q.y * s, z: q.z * s }
}

/** Hamilton product a ⊗ b. */
export const quatMul = (a: Quat, b: Quat): Quat => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
})

export const quatConjugate = (q: Quat): Quat => ({ w: q.w, x: -q.x, y: -q.y, z: -q.z })

/** Yaw/pitch/roll (deg, ZYX) → quaternion. Fallback when DMP quaternion absent. */
export const yprToQuat = (yawDeg: number, pitchDeg: number, rollDeg: number): Quat => {
  const cy = Math.cos((yawDeg * DEG2RAD) / 2)
  const sy = Math.sin((yawDeg * DEG2RAD) / 2)
  const cp = Math.cos((pitchDeg * DEG2RAD) / 2)
  const sp = Math.sin((pitchDeg * DEG2RAD) / 2)
  const cr = Math.cos((rollDeg * DEG2RAD) / 2)
  const sr = Math.sin((rollDeg * DEG2RAD) / 2)
  return normalizeQuat({
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  })
}

/** Yaw (rad) of a quaternion (ZYX convention). */
export const yawOfQuat = (q: Quat): number =>
  Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))

export const quatFromInput = (s: ImuFrameInput): Quat =>
  s.quaternion ? normalizeQuat(s.quaternion) : yprToQuat(s.yaw, s.pitch, s.roll)

/** Scrubbing intensity (deg/s magnitude) — drives motion-gated coverage. */
export const gyroMagnitude = (s: ImuFrameInput): number =>
  s.gyro ? Math.hypot(s.gyro.x, s.gyro.y, s.gyro.z) : 0
