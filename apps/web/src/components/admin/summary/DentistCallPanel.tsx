'use client'

import { CalendarDaysIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid'
import type { BoardStudent } from '@/hooks/useBoard'
import { VERDICT_META } from '@/lib/followUp'
import { formatDateTimeMn } from '@/lib/dateMn'

// Эмчтэй хийсэн видео дуудлагын дараа эмчийн үлдээсэн зөвлөгөө (appointmentNote) ба
// товлосон цаг (appointmentAt) — аль хэдийн /api/board/students-ээс BoardStudent дээр
// ирдэг. Энд сурагчийн дүгнэлт дээр гаргаж харуулна. Дуудлага болоогүй/тэмдэглэлгүй бол
// огт харагдахгүй.
const DentistCallPanel = ({ student: s }: { student: BoardStudent }) => {
  if (!s.appointmentAt && !s.appointmentNote) return null
  const verdict = s.dentistVerdict ? VERDICT_META[s.dentistVerdict] : null

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Эмчийн дуудлагын тэмдэглэл</p>

      {s.appointmentAt && (
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 shrink-0 text-text-muted" />
          <p className="text-[12px] text-text-base">
            <span className="font-semibold tabular-nums">{formatDateTimeMn(s.appointmentAt)}</span>
            {s.appointmentDentistName && <span className="text-text-muted"> · {s.appointmentDentistName} эмч</span>}
          </p>
        </div>
      )}

      {s.appointmentNote ? (
        <div className="flex items-start gap-2">
          <ChatBubbleLeftEllipsisIcon className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <p className="min-w-0 text-[12px] leading-relaxed text-text-base">
            {verdict && <span className={`font-bold ${verdict.text}`}>{verdict.label} — </span>}
            {s.appointmentNote}
          </p>
        </div>
      ) : (
        <p className="pl-6 text-[11px] text-text-muted">Дуудлагын дараах тэмдэглэл хараахан бичигдээгүй.</p>
      )}
    </div>
  )
}

export default DentistCallPanel
