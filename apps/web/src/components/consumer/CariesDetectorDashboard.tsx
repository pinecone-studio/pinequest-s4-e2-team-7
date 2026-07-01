'use client'

import { useRef, useState } from 'react'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { saveScanResult, saveQuestionnaire, type ScanResult } from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { screeningSaveErrorText } from '@/lib/screeningApi'
import { useSaveScreening } from '@/hooks/useSaveScreening'
import { useToast } from '@/components/ui/Toast'
import { ClassChildPicker, type ScreenTarget } from './caries/ClassChildPicker'
import { ScanUploader } from './caries/ScanUploader'
import { ResultsPanel } from './caries/ResultsPanel'
import { ScreeningStepper } from './caries/ScreeningStepper'
import { QuestionnaireStep, isSymptomAnswersComplete, type SymptomAnswers } from './caries/QuestionnaireStep'
import { MAX_UPLOAD_BYTES, fileToDataUrl } from './caries/imageUtils'

/** Скрининг: асуумж + зураг зэрэгцээ (2 багана), бүгд бэлэн болмогц доор дүгнэлт гарна.
 *  Асуумж дүгнэлтийг баяжуулдаг тул зөвхөн бөглөгдсөн үед л шинжилгээ идэвхжинэ. */
export const CariesDetectorDashboard = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [answers, setAnswers] = useState<SymptomAnswers>({})
  const [target, setTarget] = useState<ScreenTarget | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [persistUrl, setPersistUrl] = useState<string | null>(null)
  const [resetSignal, setResetSignal] = useState(0)
  const save = useSaveScreening()
  const toast = useToast()

  const qDone = isSymptomAnswersComplete(answers)
  const canAnalyze = Boolean(target && qDone && file && preview && !analyzing)
  const step = result ? 3 : qDone ? 2 : 1

  const onFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setAnalysisError('Зөвхөн зураг (jpg, png) оруулна уу.')
    if (f.size > MAX_UPLOAD_BYTES) return setAnalysisError('Зураг хэт том байна — 10MB-аас бага зураг оруулна уу.')
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setPersistUrl(null); setAnalysisError(null); save.reset()
  }

  const runAnalysis = async () => {
    if (!canAnalyze || !preview || !file || !target) return
    saveQuestionnaire({
      childName: target.childLabel, age: target.age ?? '', lastDentalVisit: '',
      hasPainfulTooth: answers.hasPainfulTooth!, painWhen: answers.painWhen,
      painSince: answers.painSince, feverSwelling: answers.feverSwelling,
    })
    setAnalyzing(true); setAnalysisError(null); save.reset()
    try {
      const dataUrl = await fileToDataUrl(file).catch(() => preview)
      const scan = await analyzeScanImage(file, dataUrl, target.age)
      saveScanResult(scan)
      sessionStorage.setItem('screener.lastCapture', dataUrl)
      setPersistUrl(dataUrl); setResult(scan)
    } catch (err) {
      setAnalysisError(scanErrorText(err instanceof Error ? err.message : 'inference_failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const clearScan = () => {
    setPreview(null); setFile(null); setResult(null); setPersistUrl(null); setAnalysisError(null); save.reset()
    if (fileRef.current) fileRef.current.value = ''
  }
  const restart = () => { clearScan(); setAnswers({}); setTarget(null); setResetSignal((n) => n + 1) }

  const onSave = () => {
    if (!result || !target || !persistUrl || save.isPending) return
    save.mutate({ scan: result, target, persistUrl }, {
      onSuccess: () => { toast.success(`${target.childLabel} — бүртгэлд хадгаллаа`); restart() },
      onError: (e) => toast.error(screeningSaveErrorText(e instanceof Error ? e.message : 'error')),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <ClassChildPicker onChange={setTarget} resetSignal={resetSignal} />
      <ScreeningStepper current={step} />

      {/* Асуумж + зураг зэрэгцээ — 2 багана ижил өндөртэй (grid stretch) */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <FlatCard className="h-full p-6">
          <QuestionnaireStep answers={answers} onChange={setAnswers} />
        </FlatCard>
        <div className="flex h-full flex-col gap-2">
          <ScanUploader
            className="flex-1"
            fileRef={fileRef} displayImage={result?.imageUrl ?? preview} displayDetections={result?.detections ?? []}
            analyzing={analyzing} analysisError={analysisError} canAnalyze={canAnalyze}
            onFile={onFile} onAnalyze={runAnalysis} onClear={clearScan}
          />
          {!qDone && <p className="px-1 text-[12px] text-text-muted">Дүгнэлт гаргахын өмнө зүүн талын асуумжийг бөглөнө үү.</p>}
          {qDone && !target && <p className="px-1 text-[12px] text-text-muted">Хүүхэд сонгоно уу.</p>}
        </div>
      </div>

      {/* Бүх алхам дуусмагц — дүгнэлт доор */}
      {result && (
        <FlatCard glass className="flex flex-col overflow-hidden p-0">
          <div className="p-6 xl:p-8"><ResultsPanel result={result} /></div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/50 bg-surface/60 px-5 py-4">
            {!target && <p className="mr-auto text-[12px] text-text-muted">Хадгалахын тулд хүүхэд сонгоно уу</p>}
            <button type="button" onClick={onSave} disabled={!target || save.isPending || save.isSuccess}
              className="btn shrink-0 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
              {save.isPending ? 'Хадгалж байна…' : save.isSuccess ? '✓ Хадгаллаа' : 'Дүгнэлтийг хадгалах'}
            </button>
          </div>
        </FlatCard>
      )}
    </div>
  )
}
