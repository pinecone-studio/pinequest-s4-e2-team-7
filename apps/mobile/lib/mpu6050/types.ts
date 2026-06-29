/** MPU6050 sample types — mirror of apps/web/src/lib/mpu6050/types.ts. */

export type DmpQuaternion = { w: number; x: number; y: number; z: number }

export type Mpu6050Vector3 = { x: number; y: number; z: number }

/** Payload from ESP32 — DMP quaternion + raw accel/gyro register reads. */
export type Mpu6050Sample = {
  yaw: number
  pitch: number
  roll: number
  quaternion?: DmpQuaternion
  accel?: Mpu6050Vector3
  gyro?: Mpu6050Vector3
  at: number
}

export type Mpu6050EulerDeg = { yaw: number; pitch: number; roll: number }
