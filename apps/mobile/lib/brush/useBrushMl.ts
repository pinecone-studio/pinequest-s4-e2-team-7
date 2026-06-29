import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrushMlState, processSensorFrame } from '@/lib/brushMl/model'
import type { BrushMlState, BrushSensorFrame } from '@/lib/brushMl/types'
import { parseBrushLabel } from '@/lib/brush/zones'

/** How often we fold the live zone into the per-tooth arch coverage (ms). */
const TICK_MS = 250

/**
 * Drives the per-tooth ML arch coverage from the recognizer's live zone label.
 * The IMU resolves quadrant × surface, so the tooth index is swept synthetically
 * within the active quadrant to spread coverage across the arch.
 */
export const useBrushMl = (currentZone: string, running: boolean) => {
  const [mlState, setMlState] = useState<BrushMlState>(() => createBrushMlState())
  const zoneRef = useRef(currentZone)
  zoneRef.current = currentZone

  const reset = useCallback(() => setMlState(createBrushMlState()), [])

  useEffect(() => {
    if (!running) return
    let tick = 0
    const id = setInterval(() => {
      const parsed = parseBrushLabel(zoneRef.current)
      if (!parsed) return
      tick += 1
      const sweep = parsed.quadrant === 'UL' || parsed.quadrant === 'LL' ? -8 : 8
      const frame: BrushSensorFrame = {
        timestamp: Date.now(),
        zone: parsed.quadrant,
        surface: parsed.surface,
        pressure: 0.62,
        tiltDeg: Math.sin(tick / 8) * 38 + sweep,
      }
      setMlState((prev) => processSensorFrame(prev, frame))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running])

  return { mlState, reset }
}
