'use client'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { TriageLevel } from '@pinequest/types'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { childSummaryNarrative, formatChildName } from '@pinequest/core'
import { ImageGallery, EmptyQuestionnairePanel, RawQuestionnairePanel, HospitalGuidePanel } from './SummaryPanels'
import { ResultHeader, ContactPanel } from './SummaryHeader'
import DentistCallPanel from './DentistCallPanel'
import LongitudinalDeltaBar from './LongitudinalDeltaBar'
import { formatDateMn } from '@/lib/dateMn'
import { GuidanceSections } from '@/components/consumer/caries/GuidanceSections'
import Skeleton from '@/components/ui/Skeleton'

type Props = {
  student: BoardStudent
  detail: ChildSummaryPayload | undefined
  isLoading: boolean
  // History tab passes a PAST season; omitted → the child's latest, derived from `student`.
  view?: { level: TriageLevel; screenedAt: string; prior?: { level: TriageLevel; seasonId: string } }
}

// Shared body for every student-summary view. Everything is derived straight from ONE
// screening event (the latest by default, or the `view` season from the history tab):
// date, triage verdict, photos, the phone questionnaire, and the Gemini advice/guidance.
const StudentSummaryBody = ({ student, detail, isLoading, view }: Props) => {
  const level = view?.level ?? student.latestLevel ?? 'none'
  const summary = detail?.summary
  const screenedAt = view?.screenedAt ?? student.screenedAt
  const date = screenedAt ? formatDateMn(screenedAt) : '—'
  const name = formatChildName(student)

  // Comparison strip: only shown on the history tab (a specific past season vs the one before it).
  const compareLevel = view?.level
  const priorSlot = view?.prior

  // Утсан дээр гарсан Gemini дүгнэлт. Урт текстийг өгүүлбэр бүрээр салгаж мөр болгоно (утастай ижил).
  const adviceText = detail?.advice?.trim() || ''
  const adviceConclusion = adviceText
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const guidance = detail?.guidance

  return (
    <div className="flex flex-col gap-4">
      {/* Өмнөх ↔ сонгосон дүгнэлтийн харьцуулалт — зөвхөн "Өмнөх дүгнэлтүүд" таб (view) дээр,
          "Сүүлийн дүгнэлт" (латест) дээр харагдахгүй. */}
      {view && compareLevel && <LongitudinalDeltaBar currentLevel={compareLevel} prior={priorSlot} />}

      {/* Огноо түрүүнд — дараа нь скринингийн дүгнэлт. Доорх бүх зүйл яг энэ скринингээс гарна. */}
      <ResultHeader date={date} level={level} />

      {/* Эмчтэй дуудлага хийсэн бол товлосон цаг + эмчийн дараах тэмдэглэлийг харуулна.
          Зөвхөн сүүлийн дүгнэлт дээр (өмнөх улирлын `view` дээр биш). */}
      {!view && <DentistCallPanel student={student} />}

      <ImageGallery refs={detail?.imageRefs ?? []} screeningId={detail?.summary?.screeningId} />

      {isLoading && <Skeleton className="h-28 rounded-2xl" />}
      {/* Мобайл дата (questionnaireRaw) байвал утсан дээр асуусан яг хариултыг харуулна; web дээр
          5 асуулт асуудаггүй тул "Асуумж байхгүй" төлөвийг харуулна. */}
      {!isLoading && (detail?.questionnaireRaw?.length
        ? <RawQuestionnairePanel answers={detail.questionnaireRaw} />
        : <EmptyQuestionnairePanel />)}

      {/* Дүгнэлт + зөвлөгөө — утсан дээр гарсан Gemini-ийн advice/guidance-ийг яг тэр хэвээр харуулна.
          Gemini байхгүй (offline) бол core narrative + гэрийн алхмууд руу буцна. */}
      {(adviceText || summary) && (
        <div className="rounded-2xl border border-triage-yellow/20 bg-triage-yellow-bg p-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-triage-yellow">{name}-д тохирсон зөвлөгөө</p>
          {adviceText
            ? adviceConclusion.map((line, i) => (
                <p key={i} className="mb-1.5 text-[12px] leading-relaxed text-text-muted last:mb-0">{line}</p>
              ))
            : summary && (
                <>
                  <p className="mb-2 text-[12px] leading-relaxed text-text-muted">{name}, {childSummaryNarrative(summary)}</p>
                  <p className="text-[13px] font-semibold leading-snug text-text-base">{summary.headline}</p>
                </>
              )}
          {/* Gemini guidance байхгүй (offline) үед л core-ийн гэрийн алхмуудыг энд харуулна. */}
          {!guidance && (summary?.homeSteps.length ?? 0) > 0 && (
            <>
              <p className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Гэрийн нөхцөлд авах арга хэмжээ</p>
              <ul className="flex flex-col gap-2">
                {(summary?.homeSteps ?? []).map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
                    <CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-triage-yellow/70" />{step}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {/* Дэлгэрэнгүй зөвлөмж — скрининг дашбордтой ЯГ ИЖИЛ рендер (GuidanceSections). */}
      {guidance && <GuidanceSections guidance={guidance} />}
      {!adviceText && !summary && !isLoading && (
        <p className="rounded-2xl border border-border bg-surface-raised p-4 text-[13px] text-text-muted">Энэ сурагч шалгагдаагүй байна.</p>
      )}

      {detail?.hospital && <HospitalGuidePanel h={detail.hospital} />}

      <ContactPanel phone={student.guardianPhone} email={student.guardianEmail} />
    </div>
  )
}

export default StudentSummaryBody
