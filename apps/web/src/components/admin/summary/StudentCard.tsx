'use client'

import {
  ArrowsPointingOutIcon, EnvelopeIcon, PencilSquareIcon, TrashIcon,
  ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, CalendarDaysIcon,
} from '@heroicons/react/24/solid'
import type { ComponentType, SVGProps } from 'react'
import type { FollowUpStatus } from '@pinequest/types'
import { formatChildName } from '@pinequest/core'
import type { BoardStudent } from '@/hooks/useBoard'
import IconButton from '@/components/ui/IconButton'
import { formatSeason } from '@/lib/season'
import { formatDayMonthMn } from '@/lib/dateMn'
import { effectiveFollowUpStatus, improvedFromRed } from '@/lib/followUp'
import { TRIAGE_LABEL, TRIAGE_TEXT, TRIAGE_SOFT, TRIAGE_ICON, TRIAGE_NONE } from '@/lib/triage'
import SeasonDotRail from './SeasonDotRail'

// Triage = STATUS accent only (avatar tint + result row text). The card surface
// stays neutral in both themes — never tint the whole card. Labels/colours/icons
// come from the one canonical triage vocabulary in @/lib/triage.
type Triage = { text: string; soft: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; head: string }
const TONE: Record<string, Triage> = {
  red:    { text: TRIAGE_TEXT.red,    soft: TRIAGE_SOFT.red,    Icon: TRIAGE_ICON.red,    head: TRIAGE_LABEL.red },
  yellow: { text: TRIAGE_TEXT.yellow, soft: TRIAGE_SOFT.yellow, Icon: TRIAGE_ICON.yellow, head: TRIAGE_LABEL.yellow },
  green:  { text: TRIAGE_TEXT.green,  soft: TRIAGE_SOFT.green,  Icon: TRIAGE_ICON.green,  head: TRIAGE_LABEL.green },
  none:   { text: TRIAGE_NONE.text,   soft: TRIAGE_NONE.soft,   Icon: TRIAGE_NONE.Icon,   head: TRIAGE_NONE.label },
}

type FuCategory = { label: string; dot: string; text: string; bg: string }
const FU_CATEGORY: Partial<Record<FollowUpStatus, FuCategory>> = {
  flagged:           { label: 'Шинэ',          dot: 'bg-fu-flagged',   text: 'text-fu-flagged',   bg: 'bg-fu-flagged-bg' },
  contacted:         { label: 'Хяналтад',       dot: 'bg-fu-contacted', text: 'text-fu-contacted', bg: 'bg-fu-contacted-bg' },
  doctor_connected:  { label: 'Хяналтад',       dot: 'bg-fu-contacted', text: 'text-fu-contacted', bg: 'bg-fu-contacted-bg' },
  unclear:           { label: 'Хяналтад',       dot: 'bg-fu-contacted', text: 'text-fu-contacted', bg: 'bg-fu-contacted-bg' },
  treatment_done:    { label: 'Шийдвэрлэсэн',  dot: 'bg-fu-done',      text: 'text-fu-done',      bg: 'bg-fu-done-bg' },
  treatment_refused: { label: 'Шийдвэрлэсэн',  dot: 'bg-fu-done',      text: 'text-fu-done',      bg: 'bg-fu-done-bg' },
}

type Props = {
  student: BoardStudent
  onOpen: () => void
  onSend?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const StudentCard = ({ student: s, onOpen, onSend, onEdit, onDelete }: Props) => {
  const t = TONE[s.latestLevel ?? 'none']
  const date = s.screenedAt ? new Date(s.screenedAt).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' }) : '—'
  // Улаанаас сайжирсан бол дагалтын төлөв автоматаар "Эмчилгээ хийлгэсэн" болно.
  const followUp = effectiveFollowUpStatus(s)
  const showFollowUp = s.followUpStatus != null || improvedFromRed(s)

  return (
    <div className={`grow flex h-full flex-col gap-3 blob bg-surface p-4 shadow-(--shadow-card) hover:shadow-(--shadow-card-lg) ${
      s.escalationFlag ? 'border border-triage-red/30 ring-1 ring-triage-red/20' : 'border border-border'
    }`}>
      {/* header */}
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl text-[15px] font-black ${t.soft} ${t.text}`}>{s.lastName.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-text-base">{formatChildName(s)}</p>
          <p className="text-[12px] text-text-muted">{s.className || '—'} · {s.seasonId ? formatSeason(s.seasonId) : '—'}</p>
        </div>
        <IconButton Icon={ArrowsPointingOutIcon} tone="plain" size="sm" label="Дэлгэрэнгүй" onClick={onOpen} />
      </div>

      {/* escalation warning: prior treatment refused, now worsened */}
      {s.escalationFlag && (
        <div className="flex items-center gap-2 rounded-2xl bg-triage-red-bg px-3 py-2">
          <ExclamationTriangleIcon className="size-3.5 shrink-0 text-triage-red" />
          <span className="text-[11px] font-semibold text-triage-red">Өмнөх эмчилгээ хийгдээгүй, одоо хүндэрсэн</span>
        </div>
      )}

      {/* status result — the ONLY coloured element; opens the summary modal */}
      <button onClick={onOpen} className="tap flex items-center gap-2 rounded-full bg-surface-raised px-3 py-2.5 text-left transition-colors hover:bg-border/50">
        <t.Icon className={`size-4 shrink-0 ${t.text}`} />
        <span className={`flex-1 truncate text-[13px] font-bold ${t.text}`}>{t.head}</span>
        <span className="shrink-0 text-[11px] text-text-muted">{date}</span>
      </button>

      {/* эмчийн дуудлагын дараах тэмдэглэл / товлосон цаг — байвал л харагдана */}
      {(s.appointmentNote || s.appointmentAt) && (
        <div className="flex items-start gap-1.5 rounded-2xl bg-primary/5 px-3 py-2">
          {s.appointmentNote ? (
            <>
              <ChatBubbleLeftEllipsisIcon className="mt-px size-3.5 shrink-0 text-primary" />
              <p className="line-clamp-2 text-[11px] leading-snug text-text-muted">{s.appointmentNote}</p>
            </>
          ) : (
            <>
              <CalendarDaysIcon className="mt-px size-3.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-snug text-text-muted">
                <span className="font-semibold tabular-nums text-text-base">{formatDayMonthMn(s.appointmentAt!)}</span> — эмчтэй товлосон
              </p>
            </>
          )}
        </div>
      )}

      {/* season dot rail — only shown for multi-season children */}
      <SeasonDotRail history={s.seasonHistory ?? []} trend={s.trend ?? null} />

      {/* actions — follow-up state on the left, quick actions on the right */}
      <div className="mt-auto flex items-center gap-2 border-t border-border-muted pt-3">
        {showFollowUp && (() => {
          const fu = FU_CATEGORY[followUp]
          return fu ? (
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${fu.bg}`}>
              <span className={`size-1.5 shrink-0 rounded-full ${fu.dot}`} />
              <span className={`text-[11px] font-semibold ${fu.text}`}>{fu.label}</span>
            </span>
          ) : null
        })()}
        <span className="flex-1" />
        {onSend && <IconButton Icon={EnvelopeIcon} tone="plain" size="sm" label="Эцэг эхэд илгээх" onClick={onSend} />}
        {onEdit && <IconButton Icon={PencilSquareIcon} tone="plain" size="sm" label="Засах" onClick={onEdit} />}
        {onDelete && <IconButton Icon={TrashIcon} tone="plain" size="sm" label="Устгах" onClick={onDelete} className="hover:bg-triage-red-bg hover:text-triage-red" />}
      </div>
    </div>
  )
}

export default StudentCard
