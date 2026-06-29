'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, RotateCcw, Upload, Stethoscope, MapPin, AlertTriangle } from '@/lib/icons'
import Link from 'next/link'
import { FilterPill, FlatCard, PillButton } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import {
  addChildName,
  getChildNames,
  getLastScanResult,
  getQuestionnaire,
  saveScanResult,
  type ScanDetection,
  type ScanResult,
} from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

// ── Илрүүлсэн зүйлсийн нэр томьёо ───────────────────────────────────────────
// Мэргэжлийн нэр + хүн ойлгодог тайлбарыг хоёуланг нь харуулна

interface DetectionMeta {
  label: string // Дэлгэцэнд харуулах нэр
  description: string // Энгийн тайлбар
  emoji: string // Харааны дохио
}

const DETECTION_META: Record<string, DetectionMeta> = {
  Caries: {
    label: 'Кариес',
    description: 'Шүдний цооролт — эхний үе',
    emoji: '🔴',
  },
  Cavity: {
    label: 'Цооролт',
    description: 'Шүдэнд нүх үүссэн',
    emoji: '🔴',
  },
  Crack: {
    label: 'Хагарал',
    description: 'Шүдний гадаргуу хагарсан',
    emoji: '🟡',
  },
  Healthy: {
    label: 'Эрүүл',
    description: 'Асуудал илрэхгүй байна',
    emoji: '🟢',
  },
}

const getMeta = (d: ScanDetection): DetectionMeta =>
  DETECTION_META[d.label] ?? { label: d.label, description: '', emoji: '⚪' }

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024


const fileToDataUrl = (file: File, maxEdge = 640): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('no_canvas'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('bad_image'))
    }
    img.src = url
  })

// ── Зураг дээр detection box харуулах ────────────────────────────────────────

const IntraoralImageView = ({
  imageUrl,
  detections,
}: {
  imageUrl: string
  detections: ScanDetection[]
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-surface-raised">
    <img src={imageUrl} alt="Шүдний ойрын зураг" className="w-full object-contain" />
    {detections.map((d, i) => {
      const meta = getMeta(d)
      return (
        <div
          key={i}
          className="absolute rounded-lg border border-[#F3B900]/70 bg-[#F3B900]/10"
          style={{
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
          }}
        >
          <span className="absolute -top-6 left-0 max-w-[180px] truncate rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {meta.emoji} {meta.label} · {(d.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )
    })}
  </div>
)

// ── Нэг detection мөр ────────────────────────────────────────────────────────

const DetectionItem = ({ d }: { d: ScanDetection }) => {
  const meta = getMeta(d)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base leading-none">{meta.emoji}</span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text-base truncate">{meta.label}</p>
          {meta.description ? (
            <p className="text-[12px] text-text-muted truncate">{meta.description}</p>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-bold tabular-nums text-text-base">
        {(d.confidence * 100).toFixed(1)}%
      </span>
    </div>
  )
}

// ── Үр дүнгийн самбар ────────────────────────────────────────────────────────

const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const triageLevel =
    result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'
  const triageLabel =
    triageLevel === 'red'
      ? 'Яаралтай эмчилгээх хийлгэх'
      : triageLevel === 'yellow'
        ? 'Анхаарал шаардлагатай'
        : 'Хэвийн байдалтай'

  // Gemini-ийн зөвлөмжийг үргэлж харуулна — urgent эсэхэд үл хамаарна
  const triageSummary = result.advice

  // Healthy-ийг тооцохгүйгээр асуудалтай зүйлсийг тоол
  const problemDetections = result.detections.filter((d) => d.label !== 'Healthy')
  const healthyDetections = result.detections.filter((d) => d.label === 'Healthy')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-text-base">Үр дүн</h2>
        {/* FIX: YOLOv8 биш Gemini AI гэж зөв харуулна */}
        <p className="mt-1 text-[13px] text-text-muted">
          Шинжилгээ: Gemini AI Vision (судалгаа / демо)
        </p>
      </div>

      <TriageHeroCard level={triageLevel} label={triageLabel} summary={triageSummary} />

      {/* Зөвлөмж — advice давхцахгүйн тулд triageLevel yellow/red үед л тусад нь харуулна */}
      {triageLevel === 'green' && (
        <FlatCard className="p-6">
          <p className="text-[12px] font-bold uppercase tracking-wide text-text-muted">Зөвлөмж</p>
          <p className="mt-4 text-[15px] leading-relaxed text-text-base">{result.advice}</p>
        </FlatCard>
      )}

      {/* Илрүүлсэн асуудлууд */}
      {problemDetections.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            Илрүүлсэн асуудал ({problemDetections.length})
          </p>
          <div className="space-y-2">
            {problemDetections.map((d, i) => (
              <DetectionItem key={`problem-${i}`} d={d} />
            ))}
          </div>
        </div>
      )}

      {/* Эрүүл шүднүүд */}
      {healthyDetections.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            Эрүүл хэсэг ({healthyDetections.length})
          </p>
          <div className="space-y-2">
            {healthyDetections.map((d, i) => (
              <DetectionItem key={`healthy-${i}`} d={d} />
            ))}
          </div>
        </div>
      )}

      {result.detections.length === 0 && (
        <p className="text-[14px] text-text-muted">Илрүүлсэн зүйл байхгүй байна.</p>
      )}

      <Link href={ROUTES.doctor.chat}>
        <PillButton variant="primary" className="w-full">
          <Stethoscope className="size-4" strokeWidth={2} />
          Бүртгэлтэй шүдний эмчтэй холбогдон зөвөлгөө авах
        </PillButton>
      </Link>

      {(triageLevel === 'red' || triageLevel === 'yellow') && (
        <Link href={ROUTES.doctor.map}>
          <PillButton variant="secondary" className="w-full">
            <MapPin className="size-4" strokeWidth={2} />
            Өөрт хамгийн ойр шүдний эмнэлэг 
          </PillButton>
        </Link>
      )}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Бид зурагт үндэслэсэн дүгнэлт гаргаж амны хөндийн байдлыг үнэлэн чиглүүлэх зорилготой.
      </p>
    </div>
  )
}

// ── Үндсэн компонент ──────────────────────────────────────────────────────────

export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [childNames, setChildNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const stored = getChildNames()
    const q = getQuestionnaire()
    const names = q?.childName && !stored.includes(q.childName) ? [...stored, q.childName] : stored
    setChildNames(names)
    if (names.length) setActiveFilter((cur) => cur || names[0])
  }, [])

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    setNewName('')
    if (!trimmed || childNames.includes(trimmed)) return
    addChildName(trimmed)
    setChildNames((prev) => [...prev, trimmed])
    setActiveFilter(trimmed)
  }

  useEffect(() => {
    if (initialResult) {
      const saved = getLastScanResult()
      if (saved) {
        setResult(saved)
        setPreview(saved.imageUrl)
      }
    }
  }, [initialResult])

  const onFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setAnalysisError('Зөвхөн зураг (jpg, png) оруулна уу.')
      return
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setAnalysisError('Зураг хэт том байна — 10MB-аас бага зураг оруулна уу.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setAnalysisError(null)
  }

  const runAnalysis = async () => {
    if (!preview || !file) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const persistUrl = await fileToDataUrl(file).catch(() => preview)
      const scanResult = await analyzeScanImage(file, persistUrl)
      saveScanResult(scanResult)
      sessionStorage.setItem('screener.lastCapture', persistUrl)
      setResult(scanResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'inference_failed'
      setAnalysisError(scanErrorText(message))
    } finally {
      setAnalyzing(false)
    }
  }

  const clearAll = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setAnalysisError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayImage = result?.imageUrl ?? preview
  const displayDetections = result?.detections ?? []

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Child selector — add a child by name */}
      <div className="flex flex-wrap items-center gap-2">
        {childNames.map((name) => (
          <FilterPill
            key={name}
            label={name}
            active={activeFilter === name}
            onClick={() => setActiveFilter(name)}
          />
        ))}
        <form onSubmit={handleAddChild} className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Хүүхдийн нэр"
            aria-label="Хүүхдийн нэр нэмэх"
            className="w-36 rounded-full border border-border bg-surface-raised px-4 py-2 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-[#F3B900]"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            aria-label="Хүүхэд нэмэх"
            title="Хүүхэд нэмэх"
            className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-5" strokeWidth={2} />
          </button>
        </form>
      </div>

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column */}
        <div className="flex min-h-0 flex-col gap-6">
          <FlatCard className="flex h-full flex-col overflow-y-auto p-8">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />

            {!displayImage ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  onFile(e.dataTransfer.files?.[0] ?? null)
                }}
                className={cn(
                  'flex min-h-[320px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200',
                  dragOver
                    ? 'border-[#F3B900] bg-[#F3B900]/10'
                    : 'border-border bg-surface-raised hover:border-[#F3B900]/50 hover:bg-[#F3B900]/5',
                )}
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <Upload className="size-7 text-text-muted" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[16px] font-semibold text-text-base">
                    Амны хөндийн ойрын зураг оруулна уу.
                  </p>
                  <p className="mt-2 max-w-sm text-[13px] text-text-muted">
                    Зургийг энд чирэх эсвэл дарж оруулж болно.
                  </p>
                </div>
              </button>
            ) : null}

            {analysisError ? (
              <p className="mt-4 text-[13px] text-red-600">{analysisError}</p>
            ) : null}

            {displayImage ? (
              <div className="mt-6">
                <IntraoralImageView imageUrl={displayImage} detections={displayDetections} />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PillButton
                variant="primary"
                className="min-w-[160px]"
                disabled={!file || !preview || analyzing}
                onClick={runAnalysis}
              >
                {analyzing ? 'Уншиж байна...' : 'Эхлэх'}
              </PillButton>
              <button
                type="button"
                onClick={clearAll}
                aria-label="Дахин эхлэх"
                title="Дахин эхлэх"
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-text-muted transition-all duration-200 hover:bg-surface-raised hover:text-text-base active:scale-[0.96]"
              >
                <RotateCcw className="size-5" strokeWidth={2} />
              </button>
            </div>
          </FlatCard>
        </div>

        {/* Right column — glass accent panel */}
        <div className="min-h-0 xl:sticky xl:top-28">
          {result ? (
            <FlatCard glass className="h-full overflow-y-auto p-6 xl:p-8">
              <ResultsPanel result={result} />
            </FlatCard>
          ) : (
            <FlatCard
              glass
              className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center"
            >
              <p className="mt-5 text-[17px] font-bold text-text-base">Дүгнэлт энд харагдана</p>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-text-muted">
                Зураг оруулсны дараа эхлэх товчийг дарна уу.
              </p>
            </FlatCard>
          )}
        </div>
      </div>
    </div>
  )
}
