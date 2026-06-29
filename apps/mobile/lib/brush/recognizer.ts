/**
 * Live brushing recognizer (heuristic mode) + streak emitter.
 * Mobile port of apps/web/src/lib/brush/runtime.ts, trimmed to the on-device
 * heuristic path (no TFJS model). Push the IMU stream via `push`.
 */

import { classifyHeuristic } from './heuristic'
import { gyroMagnitude, IDENTITY_QUAT, quatFromInput, type ImuFrameInput, type Quat } from './quat'
import { LIVE_STRIDE } from './config'
import { IDLE_LABEL } from './zones'

export type BrushPrediction = {
  label: string
  confidence: number
  gyroMag: number
  source: 'heuristic'
}

export class BrushRecognizer {
  private refQuat: Quat = IDENTITY_QUAT
  private frameCount = 0

  /** Set calibration ("Тэгшлэх") — current orientation becomes yaw=0 reference. */
  calibrate(sample: ImuFrameInput | null): void {
    this.refQuat = sample ? quatFromInput(sample) : IDENTITY_QUAT
  }

  /** Push one IMU sample. Returns a prediction on stride frames, else null. */
  push(sample: ImuFrameInput): BrushPrediction | null {
    this.frameCount += 1
    if (this.frameCount % LIVE_STRIDE !== 0) return null

    const gyroMag = gyroMagnitude(sample)
    const label = classifyHeuristic(sample, this.refQuat, gyroMag)
    return { label, confidence: 1, gyroMag, source: 'heuristic' }
  }
}

/**
 * Streak-based emitter — smooths noisy per-frame predictions into a stable
 * "current zone". A label must win `minStreak` predictions in a row to win.
 */
export class BrushEmitter {
  private last: string | null = null
  private streak = 0

  constructor(
    private readonly minConfidence: number,
    private readonly minStreak: number,
  ) {}

  push(pred: BrushPrediction): string | null {
    if (pred.label === IDLE_LABEL || pred.confidence < this.minConfidence) {
      this.streak = 0
      this.last = pred.label
      return pred.label === IDLE_LABEL ? IDLE_LABEL : null
    }
    if (pred.label === this.last) {
      this.streak += 1
    } else {
      this.last = pred.label
      this.streak = 1
    }
    return this.streak >= this.minStreak ? pred.label : null
  }
}
