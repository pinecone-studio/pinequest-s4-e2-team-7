import type { ComponentType, SVGProps } from 'react'
import { ExclamationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'
import type { ScanDetection } from '@/lib/consumerState'

// ── Илрүүлсэн зүйлсийн нэр томьёо ───────────────────────────────────────────
// Мэргэжлийн нэр + хүн ойлгодог тайлбарыг хоёуланг нь харуулна

type IconType = ComponentType<SVGProps<SVGSVGElement>>

export interface DetectionMeta {
  label: string // Дэлгэцэнд харуулах нэр
  description: string // Энгийн тайлбар
  Icon: IconType // Харааны дохио
  tone: string // Дохионы өнгө (triage)
}

export const DETECTION_META: Record<string, DetectionMeta> = {
  Caries: {
    label: 'Шүдний цоорол',
    description: 'Шүдний  цоорол, цөгцний бүрэн бүтэн байдал алдагдаагүй',
    Icon: ExclamationCircleIcon,
    tone: 'text-triage-red',
  },
  Cavity: {
    label: 'Цоорлын том хөндий',
    description: 'Шүдний цөгцний бүрэн бүтэн байдал алдагдсан',
    Icon: ExclamationCircleIcon,
    tone: 'text-triage-red',
  },
  Crack: {
    label: 'Шүдний хугарал, гэмтэл',
    description: 'Шүдний хугарал, гэмтэл',
    Icon: ExclamationTriangleIcon,
    tone: 'text-triage-yellow',
  },
  Healthy: {
    label: 'Харьцангуй эрүүл',
    description: 'Цоорол танигдсангүй',
    Icon: CheckCircleIcon,
    tone: 'text-triage-green',
  },
}

export const getMeta = (d: ScanDetection): DetectionMeta =>
  DETECTION_META[d.label] ?? { label: d.label, description: '', Icon: QuestionMarkCircleIcon, tone: 'text-text-muted' }

/**
 * Нэг төрлийн илрүүлэлт олон удаа давтагдвал зөвхөн ХАМГИЙН ӨНДӨР итгэлцэлтэйг
 * нь үлдээж, итгэлцлээр буурахаар эрэмбэлнэ. Ингэснээр давхардсан картууд
 * нэг болж, хамгийн чухал өөрчлөлт эхэнд харагдана.
 */
export const topDetectionPerLabel = (detections: ScanDetection[]): ScanDetection[] => {
  const best = new Map<string, ScanDetection>()
  for (const d of detections) {
    const current = best.get(d.label)
    if (!current || d.confidence > current.confidence) best.set(d.label, d)
  }
  return [...best.values()].sort((a, b) => b.confidence - a.confidence)
}
