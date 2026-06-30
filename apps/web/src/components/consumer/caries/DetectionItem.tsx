import type { ScanDetection } from '@/lib/consumerState'
import { getMeta } from './detectionMeta'

/** Илрүүлсэн нэг өөрчлөлтийн мөр — нэр, энгийн тайлбар, итгэлцлийн хувь. */
export const DetectionItem = ({ d }: { d: ScanDetection }) => {
  const meta = getMeta(d)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <meta.Icon className={`h-5 w-5 shrink-0 ${meta.tone}`} />
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
