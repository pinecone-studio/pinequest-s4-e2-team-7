'use client'

import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import type { TriageLevel } from '@pinequest/types'
import { TRIAGE_SOFT, TRIAGE_TEXT, TRIAGE_ICON, TRIAGE_LABEL, TRIAGE_NONE } from '@/lib/triage'

type Level = TriageLevel | 'none'

/** Date-first result banner — the screening date + its triage verdict, straight from the event. */
export const ResultHeader = ({ date, level }: { date: string; level: Level }) => {
  const none = level === 'none'
  const Icon = none ? TRIAGE_NONE.Icon : TRIAGE_ICON[level]
  const badge = none ? `${TRIAGE_NONE.soft} ${TRIAGE_NONE.text}` : `${TRIAGE_SOFT[level]} ${TRIAGE_TEXT[level]}`
  const label = none ? TRIAGE_NONE.label : TRIAGE_LABEL[level]
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-raised px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Шинжилгээний огноо</span>
        <span className="truncate text-[15px] font-bold text-text-base">{date}</span>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${badge}`}>
        <Icon className="size-4 shrink-0" />{label}
      </span>
    </div>
  )
}

const linkCls = 'flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text-base transition-colors hover:border-primary hover:text-primary'

/** "Холбоо барих" — surfaces the guardian's real contact actions (tel/mailto) from the roster. */
export const ContactPanel = ({ phone, email }: { phone: string | null; email: string | null }) => (
  <div className="rounded-2xl bg-surface-raised px-4 py-3">
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Холбоо барих</p>
    {phone || email ? (
      <div className="flex flex-col gap-2">
        {phone && <a href={`tel:${phone}`} className={linkCls}><PhoneIcon className="size-4 shrink-0 text-primary" />{phone}</a>}
        {email && <a href={`mailto:${email}`} className={linkCls}><EnvelopeIcon className="size-4 shrink-0 text-primary" />{email}</a>}
      </div>
    ) : (
      <p className="text-[12px] text-text-muted">Эцэг эхийн холбоо барих мэдээлэл бүртгэгдээгүй</p>
    )}
  </div>
)
