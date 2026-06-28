'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { useEsp32Imu } from '@/hooks/useEsp32Imu'
import type { ImuReading } from '@/lib/esp32Imu'
import { DEFAULT_ESP32_WS_URL, isValidEsp32WsUrl } from '@/lib/esp32Imu'
import {
  BRUSH_LABELS,
  brushLabelMn,
  type BrushLabel,
} from '@/lib/brush/zones'
import { CLIP_SECONDS } from '@/lib/brush/config'
import { quatFromInput, IDENTITY_QUAT, type Quat } from '@/lib/brush/featureContract'
import {
  clearClips,
  countByLabel,
  deleteClip,
  downloadDataset,
  getAllClips,
  sampleToRaw,
  saveClip,
  type BrushClip,
  type RawSample,
} from '@/lib/brush/clipStore'
import { ROUTES } from '@/lib/routes'

const WS_URL_STORAGE_KEY = 'esp32.wsUrl'
const RECOMMENDED_PER_LABEL = 12

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const CollectContent = () => {
  const [wsUrl, setWsUrl] = useState(DEFAULT_ESP32_WS_URL)
  const [wsReady, setWsReady] = useState(false)
  const [activeLabel, setActiveLabel] = useState<BrushLabel>(BRUSH_LABELS[0])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [calibrated, setCalibrated] = useState(false)
  const [lastClip, setLastClip] = useState<BrushClip | null>(null)

  const recordingRef = useRef(false)
  const bufferRef = useRef<RawSample[]>([])
  const refQuatRef = useRef<Quat>(IDENTITY_QUAT)
  const latestRef = useRef<ImuReading | null>(null)
  const activeLabelRef = useRef<BrushLabel>(activeLabel)
  activeLabelRef.current = activeLabel

  const onSample = useCallback((sample: ImuReading) => {
    latestRef.current = sample
    if (recordingRef.current) bufferRef.current.push(sampleToRaw(sample))
  }, [])

  const { status, reading, error, reconnect } = useEsp32Imu(wsUrl, wsReady, onSample)

  useEffect(() => {
    const saved = localStorage.getItem(WS_URL_STORAGE_KEY)?.trim()
    if (saved && isValidEsp32WsUrl(saved)) setWsUrl(saved)
    setWsReady(true)
  }, [])

  const refreshCounts = useCallback(async () => {
    setCounts(await countByLabel())
  }, [])

  useEffect(() => {
    void refreshCounts()
  }, [refreshCounts])

  const handleWsUrlChange = (next: string) => {
    setWsUrl(next)
    if (isValidEsp32WsUrl(next)) localStorage.setItem(WS_URL_STORAGE_KEY, next.trim())
  }

  const calibrate = () => {
    const s = latestRef.current
    refQuatRef.current = s ? quatFromInput(s) : IDENTITY_QUAT
    setCalibrated(true)
  }

  const record = useCallback(async () => {
    if (recordingRef.current || status !== 'connected') return
    bufferRef.current = []
    recordingRef.current = true
    setRecording(true)
    const startedAt = Date.now()

    const durationMs = CLIP_SECONDS * 1000
    setCountdown(Math.ceil(CLIP_SECONDS))
    const tick = window.setInterval(() => {
      const left = Math.ceil((durationMs - (Date.now() - startedAt)) / 1000)
      setCountdown(Math.max(0, left))
    }, 200)

    await new Promise((r) => setTimeout(r, durationMs))
    window.clearInterval(tick)
    recordingRef.current = false
    setRecording(false)
    setCountdown(0)

    const samples = bufferRef.current
    bufferRef.current = []
    if (samples.length < 8) return // too few — discard

    const clip: BrushClip = {
      id: uid(),
      label: activeLabelRef.current,
      refQuat: refQuatRef.current,
      samples,
      recordedAt: startedAt,
      durationMs,
    }
    await saveClip(clip)
    setLastClip(clip)
    await refreshCounts()
  }, [status, refreshCounts])

  const undoLast = async () => {
    if (!lastClip) return
    await deleteClip(lastClip.id)
    setLastClip(null)
    await refreshCounts()
  }

  const reset = async () => {
    if (!confirm('Бүх цуглуулсан дата устгах уу?')) return
    await clearClips()
    setLastClip(null)
    await refreshCounts()
  }

  const exportData = async () => {
    const all = await getAllClips()
    if (all.length === 0) {
      alert('Дата алга байна.')
      return
    }
    await downloadDataset()
  }

  const totalClips = Object.values(counts).reduce((a, b) => a + b, 0)
  const r = reading

  return (
    <div className="space-y-6">
      <div className="warm-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`size-2.5 rounded-full ${
              status === 'connected' ? 'bg-emerald-500' : 'bg-red-400'
            }`}
          />
          <span className="text-[13px] font-semibold text-slate-700">
            {status === 'connected' ? 'ESP32 холбогдсон' : 'ESP32 холбогдоогүй'}
          </span>
          <input
            value={wsUrl}
            onChange={(e) => handleWsUrlChange(e.target.value)}
            placeholder="ws://172.27.221.251:81"
            className="min-w-[220px] flex-1 rounded-xl border border-[#E8E4DA] px-3 py-1.5 font-mono text-[12px] text-slate-900"
          />
          <Button size="sm" variant="secondary" onClick={reconnect}>
            Холбох
          </Button>
        </div>
        {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
        {r && (
          <p className="mt-2 font-mono text-[11px] text-slate-400">
            yaw {r.yaw.toFixed(0)}° · pitch {r.pitch.toFixed(0)}° · roll {r.roll.toFixed(0)}° ·
            gyro {r.gyro ? Math.hypot(r.gyro.x, r.gyro.y, r.gyro.z).toFixed(0) : '–'}°/s
          </p>
        )}
      </div>

      <div className="warm-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              1. Тэгшлэх (нэг удаа)
            </p>
            <p className="mt-1 text-[13px] text-slate-600">
              Сойзоо урд талдаа, толгойгоо чанх босоо байлгаад дарна уу.
            </p>
          </div>
          <Button
            size="sm"
            variant={calibrated ? 'secondary' : 'primary'}
            onClick={calibrate}
            disabled={status !== 'connected'}
          >
            {calibrated ? 'Дахин тэгшлэх' : 'Тэгшлэх (0°)'}
          </Button>
        </div>

        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          2. Бүс сонгох
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRUSH_LABELS.map((label) => {
            const c = counts[label] ?? 0
            const enough = c >= RECOMMENDED_PER_LABEL
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveLabel(label)}
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  activeLabel === label
                    ? 'border-[#F3B900] bg-[#F3B900]/10'
                    : 'border-[#E8E4DA] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <p className="text-[12px] font-semibold text-slate-900">{brushLabelMn(label)}</p>
                <p className={`text-[11px] ${enough ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {c} clip {enough ? '✓' : `/ ${RECOMMENDED_PER_LABEL}`}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="warm-card p-5 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          3. Бичих · {brushLabelMn(activeLabel)}
        </p>
        <p className="mt-1 text-[13px] text-slate-600">
          Дарангуутаа {CLIP_SECONDS} секунд тухайн бүсээ жинхэнэ ёсоор угаа.
        </p>
        <div className="my-4 flex items-center justify-center">
          {recording ? (
            <div className="flex size-24 items-center justify-center rounded-full bg-red-500/15 font-mono text-[32px] font-bold text-red-600">
              {countdown}
            </div>
          ) : (
            <Button
              size="lg"
              className="rounded-full bg-[#F3B900] px-10 text-slate-900 hover:bg-[#E5AD00]"
              onClick={record}
              disabled={status !== 'connected'}
            >
              ● Бичих
            </Button>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={undoLast} disabled={!lastClip}>
            Сүүлийнхийг буцаах
          </Button>
        </div>
        {status !== 'connected' && (
          <p className="mt-2 text-[12px] text-amber-600">Бичихийн тулд эхлээд ESP32 холбоно уу.</p>
        )}
      </div>

      <div className="warm-card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-[14px] font-semibold text-slate-900">Нийт {totalClips} clip</p>
          <p className="text-[12px] text-slate-500">
            Бүс бүрт ≥{RECOMMENDED_PER_LABEL} clip цуглуулаад экспортолно уу.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={reset}>
            Цэвэрлэх
          </Button>
          <Button size="sm" onClick={exportData}>
            JSON татах
          </Button>
        </div>
      </div>

      <div className="warm-card p-5 text-[12px] text-slate-600">
        <p className="mb-2 text-[13px] font-semibold text-slate-900">Дараагийн алхам (сургалт)</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Бүх бүсээ цуглуулаад «JSON татах» дар.</li>
          <li className="font-mono text-[11px]">cd apps/web/training</li>
          <li className="font-mono text-[11px]">python3 import_clips.py ~/Downloads/brush-dataset-*.json</li>
          <li className="font-mono text-[11px]">python3 train.py</li>
          <li>
            Дуусмагц <Link href={ROUTES.brush.monitor} className="font-semibold text-[#B8860B] hover:underline">хяналт</Link>{' '}
            хуудсыг refresh хийхэд ML загвар автоматаар ачаалагдана.
          </li>
        </ol>
      </div>
    </div>
  )
}

const CollectPage = () => (
  <AppShell
    eyebrow="ML дата"
    title="Угаалтын дата цуглуулга"
    subtitle="Бүс бүрийг угааж бичиж, загвар сургах дата бэлдэнэ"
  >
    <CollectContent />
  </AppShell>
)

export default CollectPage
