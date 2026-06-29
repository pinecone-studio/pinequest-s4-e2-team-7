/**
 * MPU6050 orientation tracker — DMP quaternion + Mahony AHRS fusion, relative to
 * a calibration pose. Mirror of apps/web/src/lib/mpu6050/tracker.ts.
 */

import AHRS from 'ahrs'
import * as THREE from 'three'
import { dmpGetGravity, dmpGetYawPitchRoll, normalizeDmpQuaternion } from './dmp'
import { alignHemisphere, dmpToThreeQuaternion, MPU_TO_THREE } from './trackerMath'
import type { Mpu6050EulerDeg, Mpu6050Sample } from './types'

const DEG2RAD = Math.PI / 180

export class Mpu6050Tracker {
  private readonly mahony = new AHRS({ algorithm: 'Mahony', sampleInterval: 100, kp: 1.4, ki: 0.02, doInitialisation: true })
  private readonly sceneQuat = new THREE.Quaternion()
  private readonly targetQuat = new THREE.Quaternion()
  private calibInv: THREE.Quaternion | null = null
  private lastGyro: THREE.Vector3 | null = null
  private lastAt = 0
  private displayEuler: Mpu6050EulerDeg = { yaw: 0, pitch: 0, roll: 0 }
  private hasDmp = false
  private hasMahony = false

  reset(): void {
    this.calibInv = null
    this.lastGyro = null
    this.lastAt = 0
    this.sceneQuat.copy(MPU_TO_THREE)
    this.targetQuat.copy(MPU_TO_THREE)
    this.displayEuler = { yaw: 0, pitch: 0, roll: 0 }
    this.hasDmp = false
    this.hasMahony = false
  }

  /** Call between WebSocket packets for smoother motion (gyro extrapolation). */
  extrapolate(deltaSec: number): void {
    if (!this.lastGyro || deltaSec <= 0) return
    const spin = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(this.lastGyro.x * DEG2RAD * deltaSec, this.lastGyro.y * DEG2RAD * deltaSec, this.lastGyro.z * DEG2RAD * deltaSec, 'ZYX'),
    )
    this.targetQuat.multiply(spin)
    this.sceneQuat.slerp(this.targetQuat, 0.35)
  }

  update(sample: Mpu6050Sample): Mpu6050EulerDeg {
    const dt = this.lastAt > 0 ? Math.min(0.12, (sample.at - this.lastAt) / 1000) : 0.01
    this.lastAt = sample.at
    let sensorQuat: THREE.Quaternion | null = null

    if (sample.gyro && sample.accel) {
      this.lastGyro = new THREE.Vector3(sample.gyro.x, sample.gyro.y, sample.gyro.z)
      this.mahony.update(sample.gyro.x * DEG2RAD, sample.gyro.y * DEG2RAD, sample.gyro.z * DEG2RAD, sample.accel.x, sample.accel.y, sample.accel.z, 0, 0, 0, dt)
      const m = this.mahony.getQuaternion()
      sensorQuat = new THREE.Quaternion(m.x, m.y, m.z, m.w).normalize()
      this.hasMahony = true
    }

    if (sample.quaternion) {
      const dmp = normalizeDmpQuaternion(sample.quaternion)
      this.hasDmp = true
      this.displayEuler = dmpGetYawPitchRoll(dmp, dmpGetGravity(dmp))
      const dmpQuat = dmpToThreeQuaternion(dmp)
      if (sensorQuat) sensorQuat.slerp(alignHemisphere(dmpQuat, sensorQuat), 0.12)
      else sensorQuat = dmpQuat
    } else if (sensorQuat) {
      const e = this.mahony.getEulerAnglesDegrees()
      this.displayEuler = { yaw: e.heading, pitch: e.pitch, roll: e.roll }
    } else {
      sensorQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(sample.roll * DEG2RAD, sample.pitch * DEG2RAD, sample.yaw * DEG2RAD, 'ZYX'))
      this.displayEuler = { yaw: sample.yaw, pitch: sample.pitch, roll: sample.roll }
    }

    if (!this.calibInv) this.calibInv = sensorQuat.clone().invert()
    this.targetQuat.copy(MPU_TO_THREE).multiply(this.calibInv.clone().multiply(sensorQuat))
    this.sceneQuat.slerp(this.targetQuat, 0.65)
    return this.displayEuler
  }

  getSceneQuaternion(): THREE.Quaternion {
    return this.sceneQuat.clone()
  }

  getFusionMode(): 'dmp+mahony' | 'dmp' | 'mahony' | 'euler' {
    if (this.hasDmp && this.hasMahony) return 'dmp+mahony'
    if (this.hasDmp) return 'dmp'
    if (this.hasMahony) return 'mahony'
    return 'euler'
  }
}
