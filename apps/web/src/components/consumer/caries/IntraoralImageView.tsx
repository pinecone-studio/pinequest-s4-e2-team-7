import { ScreeningOverlay } from '@/components/consumer/ScreeningOverlay'
import type { ScanDetection } from '@/lib/consumerState'
import { getMeta } from './detectionMeta'

/** Оруулсан зураг дээр илрүүлсэн хэсгүүдийг хүрээгээр тэмдэглэж харуулна. */
export const IntraoralImageView = ({
  imageUrl,
  detections,
  scanning = false,
}: {
  imageUrl: string
  detections: ScanDetection[]
  scanning?: boolean
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-surface-raised">
    <img src={imageUrl} alt="Шүдний ойрын зураг" className="w-full object-contain" />
    {scanning && <ScreeningOverlay />}
    {detections.map((d, i) => {
      const meta = getMeta(d)
      return (
        <div
          key={i}
          className="absolute rounded-lg border border-[#0e9594]/70 bg-[#0e9594]/10"
          style={{
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
          }}
        >
          <span className="absolute -top-6 left-0 inline-flex max-w-[180px] items-center gap-1 truncate rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <meta.Icon className={`h-3 w-3 shrink-0 ${meta.tone}`} /> {meta.label} · {(d.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )
    })}
  </div>
)
