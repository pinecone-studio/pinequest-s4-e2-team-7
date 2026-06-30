import type { ScanDetection } from '@/lib/consumerState'
import { DetectionItem } from './DetectionItem'

/** Гарчигтай илрүүлэлтийн жагсаалт (асуудалтай эсвэл эрүүл бүлэг). */
export const DetectionGroup = ({
  title,
  detections,
  idPrefix,
}: {
  title: string
  detections: ScanDetection[]
  idPrefix: string
}) => {
  if (!detections.length) return null
  return (
    <div>
      <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
        {title} ({detections.length})
      </p>
      <div className="space-y-2">
        {detections.map((d, i) => (
          <DetectionItem key={`${idPrefix}-${i}`} d={d} />
        ))}
      </div>
    </div>
  )
}
