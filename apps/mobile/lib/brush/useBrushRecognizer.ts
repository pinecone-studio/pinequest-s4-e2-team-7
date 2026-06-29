import { useCallback, useRef, useState } from 'react'
import { BrushEmitter, BrushRecognizer, type BrushPrediction } from '@/lib/brush/recognizer'
import { advanceCoverage, createCoverageState, type CoverageState } from '@/lib/brush/coverageState'
import { LIVE_MIN_CONFIDENCE, LIVE_MIN_STREAK } from '@/lib/brush/config'
import { IDLE_LABEL } from '@/lib/brush/zones'
import type { ImuReading } from '@/lib/brush/imu'

export type BrushLivePred = { zone: string; confidence: number; gyroMag: number }

/**
 * Owns the live brushing recognizer + emitter + coverage tracker. Feed it the
 * raw IMU stream via `handleSample` (wire into useEsp32Imu's onSample).
 */
export const useBrushRecognizer = () => {
  const [currentZone, setCurrentZone] = useState<string>(IDLE_LABEL)
  const [coverage, setCoverage] = useState<CoverageState>(() => createCoverageState())
  const [livePred, setLivePred] = useState<BrushLivePred | null>(null)

  const recognizerRef = useRef(new BrushRecognizer())
  const emitterRef = useRef(new BrushEmitter(LIVE_MIN_CONFIDENCE, LIVE_MIN_STREAK))
  const coverageRef = useRef<CoverageState>(createCoverageState())
  const lastTickRef = useRef(0)
  const latestSampleRef = useRef<ImuReading | null>(null)
  const accrueRef = useRef(false)

  const handleSample = useCallback((sample: ImuReading) => {
    latestSampleRef.current = sample
    const pred: BrushPrediction | null = recognizerRef.current.push(sample)
    if (!pred) return

    const zone = emitterRef.current.push(pred) ?? IDLE_LABEL
    const now = Date.now()
    if (accrueRef.current) {
      const dtSec = lastTickRef.current ? (now - lastTickRef.current) / 1000 : 0
      coverageRef.current = advanceCoverage(coverageRef.current, zone, pred.gyroMag, dtSec, now)
    }
    lastTickRef.current = now

    setLivePred({ zone, confidence: pred.confidence, gyroMag: pred.gyroMag })
    setCurrentZone(zone)
    setCoverage({ ...coverageRef.current })
  }, [])

  const calibrate = useCallback(() => {
    recognizerRef.current.calibrate(latestSampleRef.current)
    lastTickRef.current = 0
  }, [])

  const resetCoverage = useCallback(() => {
    coverageRef.current = createCoverageState()
    lastTickRef.current = 0
    setCoverage(createCoverageState())
    setCurrentZone(IDLE_LABEL)
  }, [])

  /** Enable/disable coverage accrual (the live zone display keeps running). */
  const setRunning = useCallback((running: boolean) => {
    accrueRef.current = running
    if (running) lastTickRef.current = 0
  }, [])

  return { currentZone, coverage, livePred, handleSample, calibrate, resetCoverage, setRunning }
}
