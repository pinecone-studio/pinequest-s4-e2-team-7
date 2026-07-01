'use client'

import {
  EnvelopeIcon, ArrowsPointingOutIcon, ExclamationTriangleIcon,
  CalendarDaysIcon, CheckBadgeIcon,
} from '@heroicons/react/24/solid'
import { formatChildName } from '@pinequest/core'
import type { BoardStudent } from '@/hooks/useBoard'
import IconButton from '@/components/ui/IconButton'
import SeasonDotRail from '@/components/admin/summary/SeasonDotRail'
import { VERDICT_META } from '@/lib/followUp'
import { TRIAGE_LABEL, TRIAGE_TEXT, TRIAGE_SOFT, TRIAGE_ICON, TRIAGE_NONE } from '@/lib/triage'

const fmtDay = (ms: number) => new Date(ms).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

type Props = {
  student: BoardStudent
  onSend?: () => void
  onEdit: () => void
}

// Status is dentist-driven (set at the end of the video call), so the card is
// read-only here: it shows the booked appointment + the dentist's verdict, and
// clicking opens the detail modal to book / add notes. No manual status toggle.
const FollowUpCard = ({ student: s, onSend, onEdit }: Props) => {
  const level = s.latestLevel
  const tone = level
    ? { text: TRIAGE_TEXT[level], soft: TRIAGE_SOFT[level], Icon: TRIAGE_ICON[level], label: TRIAGE_LABEL[level] }
    : { text: TRIAGE_NONE.text, soft: TRIAGE_NONE.soft, Icon: TRIAGE_NONE.Icon, label: TRIAGE_NONE.label }
  const verdict = s.dentistVerdict ? VERDICT_META[s.dentistVerdict] : null

  return (
    <div onClick={onEdit} role="button" tabIndex={0}
      className="group relative flex cursor-pointer flex-col gap-4 blob border border-border bg-surface p-5 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-card-lg)">
      {/* action cluster — send to parents (brand-tinted) sits beside expand */}
      <div className="absolute right-3.5 top-3.5 flex items-center gap-1">
        {onSend && (
          <IconButton
            Icon={EnvelopeIcon} tone="plain" size="sm" label="Эцэг эхэд илгээх"
            onClick={(e) => { e.stopPropagation(); onSend() }}
            className="text-primary hover:bg-primary/10 hover:text-primary" />
        )}
        <IconButton Icon={ArrowsPointingOutIcon} tone="plain" size="sm" label="Дэлгэрэнгүй харах" onClick={onEdit} />
      </div>

      {/* avatar + name (avatar carries the soft status tint) */}
      <div className={`flex items-center gap-3 ${onSend ? 'pr-20' : 'pr-10'}`}>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-[17px] font-black ${tone.soft} ${tone.text}`}>
          {s.lastName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-text-base">{formatChildName(s)}</p>
          <p className="mt-0.5 text-[11px] font-medium text-text-muted">{s.className}</p>
        </div>
      </div>

      {/* triage status accent — the reason this child is in follow-up */}
      <div className="flex items-start gap-2">
        <tone.Icon className={`mt-px size-4.5 shrink-0 ${tone.text}`} />
        <p className={`text-[14px] font-bold leading-snug ${tone.text}`}>{tone.label}</p>
      </div>

      {s.escalationFlag && (
        <div className="flex items-center gap-2 rounded-2xl bg-triage-red-bg px-3 py-2">
          <ExclamationTriangleIcon className="size-3.5 shrink-0 text-triage-red" />
          <span className="text-[11px] font-semibold text-triage-red">Өмнөх эмчилгээ хийгдээгүй, одоо хүндэрсэн</span>
        </div>
      )}

      {/* appointment — booked date + which dentist */}
      <div className="flex items-center gap-2 rounded-2xl bg-surface-raised px-3 py-2">
        <CalendarDaysIcon className="size-4 shrink-0 text-text-muted" />
        {s.appointmentAt ? (
          <p className="min-w-0 flex-1 text-[12px] text-text-base">
            <span className="font-semibold tabular-nums">{fmtDay(s.appointmentAt)}, {fmtTime(s.appointmentAt)}</span>
            {s.appointmentDentistName && <span className="text-text-muted"> · {s.appointmentDentistName} эмч</span>}
          </p>
        ) : (
          <p className="text-[12px] text-text-muted">Эмчтэй цаг товлоогүй</p>
        )}
      </div>

      {/* dentist finished the call → verdict + advice note */}
      {verdict && (
        <div className={`rounded-2xl border border-border ${verdict.bg} px-3 py-2.5`}>
          <div className="flex items-center gap-1.5">
            <CheckBadgeIcon className={`size-4 shrink-0 ${verdict.text}`} />
            <span className={`text-[12px] font-bold ${verdict.text}`}>{verdict.label}</span>
          </div>
          {s.appointmentNote && <p className="mt-1.5 text-[12px] leading-relaxed text-text-base">{s.appointmentNote}</p>}
        </div>
      )}

      <SeasonDotRail history={s.seasonHistory ?? []} trend={s.trend ?? null} />
    </div>
  )
}

export default FollowUpCard
