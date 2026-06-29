/** Quaternion helpers for the orientation tracker (Three.js Y-up frame). */

import * as THREE from 'three'
import type { DmpQuaternion } from './types'

/** MPU6050 Z-up → Three.js Y-up (i2cdevlib default mounting). */
export const MPU_TO_THREE = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 2, 0, 0),
)

export const dmpToThreeQuaternion = (q: DmpQuaternion): THREE.Quaternion =>
  new THREE.Quaternion(q.x, q.y, q.z, q.w).normalize()

/** Flip target onto the same hemisphere as reference (avoid quaternion double-cover). */
export const alignHemisphere = (
  target: THREE.Quaternion,
  reference: THREE.Quaternion,
): THREE.Quaternion =>
  reference.dot(target) < 0
    ? target.clone().set(-target.x, -target.y, -target.z, -target.w)
    : target
