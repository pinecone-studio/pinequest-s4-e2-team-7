import { useCallback, useEffect, useRef, useState } from 'react'
import { Mpu6050Tracker } from '@/lib/mpu6050/tracker'
import { parseMpu6050Payload } from '@/lib/mpu6050/parse'
import { isValidEsp32WsUrl, type ImuReading } from '@/lib/brush/imu'

export type Esp32ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
export type Esp32SampleListener = (sample: ImuReading) => void

/** Minimal React Native WebSocket surface (avoids @types/node global clash). */
type BrushSocket = {
  close: () => void
  onopen: (() => void) | null
  onmessage: ((event: { data: unknown }) => void) | null
  onerror: (() => void) | null
  onclose: (() => void) | null
}

/** Connects to the ESP32 smart-brush over WebSocket and streams IMU samples. */
export const useEsp32Imu = (url: string, enabled = true, onSample?: Esp32SampleListener) => {
  const [status, setStatus] = useState<Esp32ConnectionStatus>('idle')
  const [reading, setReading] = useState<ImuReading | null>(null)
  const [fusionMode, setFusionMode] = useState<ReturnType<Mpu6050Tracker['getFusionMode']>>('euler')
  const [error, setError] = useState<string | null>(null)

  const trackerRef = useRef(new Mpu6050Tracker())
  const onSampleRef = useRef(onSample)
  onSampleRef.current = onSample
  const wsRef = useRef<BrushSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const calibrate = useCallback(() => trackerRef.current.reset(), [])

  const connect = useCallback(() => {
    if (!enabledRef.current) return
    const target = url.trim()
    if (!isValidEsp32WsUrl(target)) {
      setStatus('error')
      setError('WebSocket хаяг буруу байна (жишээ: ws://172.27.221.251:81)')
      return
    }
    if (reconnectRef.current) clearTimeout(reconnectRef.current)
    wsRef.current?.close()
    setStatus('connecting')
    setError(null)

    const ws = new WebSocket(target) as unknown as BrushSocket
    wsRef.current = ws
    ws.onopen = () => setStatus('connected')
    ws.onmessage = (evt) => {
      const parsed = parseMpu6050Payload(String(evt.data))
      if (!parsed) return
      onSampleRef.current?.(parsed)
      const euler = trackerRef.current.update(parsed)
      setReading({ ...parsed, ...euler })
      setFusionMode(trackerRef.current.getFusionMode())
    }
    ws.onerror = () => {
      setError(`${target} руу холбогдож чадсангүй. Утас ESP32-той ижил Wi‑Fi-д байгаа эсэхийг шалгана уу.`)
      setStatus('error')
    }
    ws.onclose = () => {
      wsRef.current = null
      if (!enabledRef.current) return setStatus('disconnected')
      setStatus('disconnected')
      reconnectRef.current = setTimeout(connect, 2500)
    }
  }, [url])

  useEffect(() => {
    if (!enabled) {
      wsRef.current?.close()
      setStatus('idle')
      return
    }
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect, enabled])

  return { status, reading, trackerRef, fusionMode, error, reconnect: connect, calibrate }
}
