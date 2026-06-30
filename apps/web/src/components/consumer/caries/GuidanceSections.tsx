import type { ComponentType, SVGProps } from 'react'
import { HomeIcon, SparklesIcon, HeartIcon, ShieldCheckIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid'
import type { ScanGuidance } from '@/lib/consumerState'

// ── Нас тохирсон гэрийн арчилгааны зөвлөмжийн хэсгүүд ─────────────────────────

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const GUIDANCE_SECTIONS: { key: keyof ScanGuidance; label: string; Icon: IconType }[] = [
  { key: 'homeCare', label: 'Гэртээ хэвшүүлэх амны хөндийн арчилгааны арга хэмжээ', Icon: HomeIcon },
  { key: 'brushing', label: 'Шүд угаах зөв арга, хугацаа', Icon: SparklesIcon },
  { key: 'diet', label: 'Шүдийг эрүүлээр хадгалахад нөлөөлөх хоол, хүнс', Icon: HeartIcon },
  { key: 'prevention', label: 'Шүд цоорох өвчнөөс урьдчилан сэргийлэх', Icon: ShieldCheckIcon },
  { key: 'nextStep', label: 'Дараагийн алхам', Icon: ArrowRightCircleIcon },
]

/** Gemini-аас ирсэн нас тохирсон дэлгэрэнгүй зөвлөмжийг карт хэлбэрээр харуулна. */
export const GuidanceSections = ({ guidance }: { guidance: ScanGuidance }) => {
  const items = GUIDANCE_SECTIONS.filter((s) => guidance[s.key]?.trim())
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.key} className="rounded-2xl border border-border bg-surface-raised p-4">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            <s.Icon className="h-4 w-4 shrink-0 text-text-muted" /> {s.label}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-text-base">{guidance[s.key]}</p>
        </div>
      ))}
    </div>
  )
}
