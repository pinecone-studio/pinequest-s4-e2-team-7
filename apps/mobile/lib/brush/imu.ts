/**
 * ESP32 IMU helpers — WebSocket URL + orientation→zone/surface inference.
 * Mirror of apps/web/src/lib/esp32Imu.ts. `ImuReading` is the MPU6050 sample.
 */

import type { BrushQuadrant } from '@/lib/brush/zones'
import type { BrushSensorFrame, ToothSurface } from '@/lib/brushMl/types'
import type { Mpu6050Sample } from '@/lib/mpu6050/types'

export type ImuReading = Mpu6050Sample

export const DEFAULT_ESP32_WS_URL =
  process.env.EXPO_PUBLIC_ESP32_WS_URL?.trim() || 'ws://172.27.221.251:81'

export const isValidEsp32WsUrl = (url: string): boolean =>
  /^wss?:\/\/[^\s/]+(:\d+)?/.test(url.trim())

const ZONE_LABELS: Record<BrushQuadrant, string> = {
  UL: 'Дээд зүүн',
  UR: 'Дээд баруун',
  LL: 'Доод зүүн',
  LR: 'Доод баруун',
}

export const zoneLabel = (zone: BrushQuadrant): string => ZONE_LABELS[zone]

export const inferZoneFromImu = (imu: ImuReading): BrushQuadrant => {
  const left = imu.yaw < -8 || imu.roll < -8
  if (imu.pitch > 12) return left ? 'UL' : 'UR'
  if (imu.pitch < -12) return left ? 'LL' : 'LR'
  return imu.pitch >= 0 ? (left ? 'UL' : 'UR') : left ? 'LL' : 'LR'
}

export const inferSurfaceFromImu = (imu: ImuReading): ToothSurface => {
  if (Math.abs(imu.pitch) < 12 && Math.abs(imu.roll) < 12) return 'occlusal'
  if (imu.roll > 15) return 'inner'
  return 'outer'
}

export const imuToSensorFrame = (imu: ImuReading): BrushSensorFrame => ({
  timestamp: imu.at,
  zone: inferZoneFromImu(imu),
  surface: inferSurfaceFromImu(imu),
  pressure: 0.62,
  tiltDeg: imu.roll,
})
