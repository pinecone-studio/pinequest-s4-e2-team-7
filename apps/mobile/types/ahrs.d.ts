// Minimal ambient types for the `ahrs` Mahony/Madgwick filter (no upstream types).
declare module 'ahrs' {
  type AhrsOptions = {
    algorithm?: 'Mahony' | 'Madgwick'
    sampleInterval?: number
    kp?: number
    ki?: number
    beta?: number
    doInitialisation?: boolean
  }
  type Quaternion = { w: number; x: number; y: number; z: number }
  type EulerDegrees = { heading: number; pitch: number; roll: number }

  export default class AHRS {
    constructor(options?: AhrsOptions)
    update(
      gx: number, gy: number, gz: number,
      ax: number, ay: number, az: number,
      mx: number, my: number, mz: number,
      dt?: number,
    ): void
    getQuaternion(): Quaternion
    getEulerAnglesDegrees(): EulerDegrees
  }
}
