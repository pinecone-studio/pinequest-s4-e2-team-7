'use client'

import { useEffect, useRef, useState } from 'react'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { getLastScanResult, saveScanResult, type ScanResult } from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { screeningSaveErrorText } from '@/lib/screeningApi'
import { useSaveScreening } from '@/hooks/useSaveScreening'
import { ClassChildPicker, type ScreenTarget } from './caries/ClassChildPicker'
import { ScanUploader } from './caries/ScanUploader'
import { ResultsPanel } from './caries/ResultsPanel'
import { MAX_UPLOAD_BYTES, fileToDataUrl } from './caries/imageUtils'

/** Скрининг хуудас — анги/хүүхэд сонгож, зураг оруулж, AI шинжилгээ хийгээд DB-д хадгална. */
export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [target, setTarget] = useState<ScreenTarget | null>(null)
  const save = useSaveScreening()

  useEffect(() => {
    if (!initialResult) return
    const saved = getLastScanResult()
    if (saved) {
      setResult(saved)
      setPreview(saved.imageUrl)
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
    save.reset()
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
      // Анги/хүүхэд сонгосон бол DB-д хадгалаад дашбордын кэшийг автоматаар синк хийнэ.
      if (target) save.mutate({ scan: scanResult, target, persistUrl })
    } catch (err) {
      setAnalysisError(scanErrorText(err instanceof Error ? err.message : 'inference_failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const clearAll = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setAnalysisError(null)
    save.reset()
    if (fileRef.current) fileRef.current.value = ''
  }

  const saveStatus = save.isPending
    ? { text: 'Сургуулийн бүртгэлд хадгалж байна…', tone: 'text-text-muted' }
    : save.isSuccess
      ? { text: `✓ ${target?.childLabel ?? 'Хүүхэд'} — бүртгэлд хадгаллаа`, tone: 'text-triage-green' }
      : save.isError
        ? { text: screeningSaveErrorText(save.error instanceof Error ? save.error.message : 'error'), tone: 'text-triage-red' }
        : null

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Анги + хүүхэд сонгоно → скрининг хадгалмагц дашборд автоматаар шинэчлэгдэнэ. */}
      <div className="flex flex-col gap-2">
        <ClassChildPicker onChange={setTarget} />
        {saveStatus && <p className={`text-[13px] font-medium ${saveStatus.tone}`}>{saveStatus.text}</p>}
      </div>

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-0 flex-col gap-6">
          <ScanUploader
            fileRef={fileRef}
            displayImage={result?.imageUrl ?? preview}
            displayDetections={result?.detections ?? []}
            analyzing={analyzing}
            analysisError={analysisError}
            canAnalyze={Boolean(file && preview && !analyzing)}
            onFile={onFile}
            onAnalyze={runAnalysis}
            onClear={clearAll}
          />
        </div>

        <div className="min-h-0 xl:sticky xl:top-28">
          {result ? (
            <FlatCard glass className="h-full overflow-y-auto p-6 xl:p-8">
              <ResultsPanel result={result} />
            </FlatCard>
          ) : (
            <FlatCard glass className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center">
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
