'use client'

import type { ReactNode } from 'react'
import { CheckCircleIcon, PhoneIcon, EnvelopeIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { ImageGallery, HospitalGuidePanel, TRIAGE_BADGE, TRIAGE_BLOCK, TRIAGE_LABEL } from './SummaryPanels'
import { QuestionnairePanel } from './QuestionnairePanel'

type Props = {
  student: BoardStudent
  detail: ChildSummaryPayload | undefined
  isLoading: boolean
  statusSlot?: ReactNode      // follow-up status control (FollowUpEditModal only)
}

const sectionLabel = 'text-[11px] font-semibold uppercase tracking-wide text-text-muted'

// Shared body for every student-summary modal. Structured as: status →
// 1. Асуумж → 2. Зураг → 3. Дүгнэлт (assessment + dentist + home care) →
// contact → hospital. One source of truth → both modals identical.
const StudentSummaryBody = ({ student, detail, isLoading, statusSlot }: Props) => {
  const level = student.latestLevel ?? 'none'
  const summary = detail?.summary
  const date = student.screenedAt
    ? new Date(student.screenedAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-xl px-3 py-1.5 text-[12px] font-semibold ${TRIAGE_BADGE[level] ?? 'border border-border bg-surface-raised text-text-muted'}`}>
          {TRIAGE_LABEL[level] ?? 'Шалгаагүй'}
        </span>
        {(detail?.screeningCount ?? 0) > 1 && (
          <span className="rounded-xl border border-border bg-surface-raised px-2.5 py-1.5 text-[12px] text-text-muted">{detail!.screeningCount} удаа шалгагдсан</span>
        )}
      </div>

      {isLoading && <div className="skeleton h-28 rounded-2xl" />}
      {detail?.questionnaire && <QuestionnairePanel q={detail.questionnaire} />}

      <div className="flex flex-col gap-2">
        <p className={sectionLabel}>2. Амны хөндийн зураг</p>
        <ImageGallery refs={detail?.imageRefs ?? []} />
      </div>

      {summary && (
        <div className="flex flex-col gap-2">
          <p className={sectionLabel}>3. Дүгнэлт</p>
          <div className={`rounded-2xl border p-4 ${TRIAGE_BLOCK[level] ?? 'border-border bg-surface-raised'}`}>
            <p className="text-[13px] font-medium leading-relaxed text-text-base">{summary.assessment}</p>

            {summary.dentistActions.length > 0 && (
              <div className="mt-3 rounded-xl border border-border bg-surface p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-text-base"><ClipboardDocumentCheckIcon className="size-4" />Эмчид зөвлөх</p>
                <ul className="flex flex-col gap-1.5">
                  {summary.dentistActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-text-muted/60" />{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.homeSteps.length > 0 && (
              <div className="mt-2.5 rounded-xl border border-border bg-surface p-3">
                <p className="mb-2 text-[12px] font-semibold text-text-base">Гэртээ хийх ({summary.ageYears} нас)</p>
                <ul className="flex flex-col gap-1.5">
                  {summary.homeSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted"><CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-text-muted/60" />{step}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.contentVersion && <p className="mt-3 text-[10px] text-text-muted/60">Урьдчилсан үзүүлэлт — онош биш. Контент: {summary.contentVersion}</p>}
          </div>
        </div>
      )}
      {!summary && !isLoading && (
        <p className="rounded-2xl border border-border bg-surface-raised p-4 text-[13px] text-text-muted">Энэ сурагч шалгагдаагүй байна.</p>
      )}

      <div className="rounded-2xl bg-surface-raised px-4">
        {[['Шалгасан огноо', date], ['Анги', `${student.className} — ${student.seasonId}`]].map(([l, v]) => (
          <div key={l} className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
            <span className="shrink-0 text-[12px] text-text-muted">{l}</span>
            <span className="text-right text-[13px] font-medium text-text-base">{v}</span>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4 border-b border-border py-2.5">
          <span className="shrink-0 text-[12px] text-text-muted">Эцэг эхийн утас</span>
          <span>{student.guardianPhone ? <a href={`tel:${student.guardianPhone}`} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"><PhoneIcon className="size-3.5" />{student.guardianPhone}</a> : <span className="text-[13px] text-text-muted">—</span>}</span>
        </div>
        <div className="flex items-start justify-between gap-4 py-2.5">
          <span className="shrink-0 text-[12px] text-text-muted">Эцэг эхийн имэйл</span>
          <span>{student.guardianEmail ? <a href={`mailto:${student.guardianEmail}`} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"><EnvelopeIcon className="size-3.5" />{student.guardianEmail}</a> : <span className="text-[13px] text-text-muted">—</span>}</span>
        </div>
      </div>

      {detail?.hospital && <HospitalGuidePanel h={detail.hospital} />}

      {statusSlot}
    </div>
  )
}

export default StudentSummaryBody
