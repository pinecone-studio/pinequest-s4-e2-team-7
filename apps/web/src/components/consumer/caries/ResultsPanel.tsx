import { AlertTriangle } from '@/lib/icons'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import type { ScanResult } from '@/lib/consumerState'
import { topDetectionPerLabel } from './detectionMeta'
import { DetectionGroup } from './DetectionGroup'
import { GuidanceSections } from './GuidanceSections'
import { ScheduleCallCard } from './ScheduleCallCard'

const TRIAGE_LABEL: Record<'green' | 'yellow' | 'red', string> = {
  red: 'Яаралтай эмчилгээ шаардлагатай',
  yellow: 'Эмчилгээ шаардлагатай',
  green: 'Дараагийн хяналтанд орох',
}

/**
 * Шинжилгээний үр дүн — 2 самбарын бүтэц:
 *  • Зүүн (наалддаг): дүгнэлт, яаралтай алхам, зурагт таньсан илрүүлэлт.
 *  • Баруун: нас тохирсон дэлгэрэнгүй зөвлөмж (гүйлгэх үед зүүн тал харагдсаар).
 */
export const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const triageLevel = result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'

  // Зөвхөн хамгийн өндөр итгэлцэлтэй илрүүлэлтийг (төрөл тус бүрээр) харуулна.
  const problems = topDetectionPerLabel(result.detections.filter((d) => d.label !== 'Healthy'))
  const healthy = topDetectionPerLabel(result.detections.filter((d) => d.label === 'Healthy'))

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold tracking-tight text-text-base">Дүгнэлт</h2>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        {/* Зүүн самбар — дүгнэлт + илрүүлэлт, гүйлгэх үед байрандаа наалдана. */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-4 lg:col-span-2">
          <TriageHeroCard level={triageLevel} label={TRIAGE_LABEL[triageLevel]} summary={result.advice} />

          {triageLevel === 'red' && <ScheduleCallCard />}

          <DetectionGroup title="Таньсан өөрчлөлтүүд" detections={problems} idPrefix="problem" />
          <DetectionGroup title="Харьцангуй эрүүл шүднүүд" detections={healthy} idPrefix="healthy" />
          {result.detections.length === 0 && (
            <p className="text-[14px] text-text-muted">Таньсан өөрчлөлт алга.</p>
          )}
        </div>

        {/* Баруун самбар — нас тохирсон дэлгэрэнгүй зөвлөмж. Gemini байхгүй бол advice-г карт болгож харуулна. */}
        <div className="flex flex-col gap-5 lg:col-span-3">
          {result.guidance ? (
            <GuidanceSections guidance={result.guidance} />
          ) : (
            <FlatCard className="p-6">
              <p className="text-[12px] font-bold uppercase tracking-wide text-text-muted">Зөвлөмж</p>
              <p className="mt-4 text-[15px] leading-relaxed text-text-base">{result.advice}</p>
            </FlatCard>
          )}
        </div>
      </div>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Зурагт үндэслэсэн дүгнэлт гаргаж амны хөндийн байдлыг үнэлэн чиглүүлэх зорилготой ба шүд цоорох өвчин ба түүний хүндрэлийн эцсийн онош биш юм.
      </p>
    </div>
  )
}
