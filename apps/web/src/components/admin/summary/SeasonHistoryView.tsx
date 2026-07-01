'use client'

import { useState } from 'react'
import type { BoardStudent } from '@/hooks/useBoard'
import { useChildSummary } from '@/hooks/useChildSummary'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import StudentSummaryBody from './StudentSummaryBody'
import { formatSeason } from '@/lib/season'
import { formatDayMonthMn } from '@/lib/dateMn'
import { TRIAGE_ICON, TRIAGE_TEXT } from '@/lib/triage'

// Pick any screened season from the dropdown → render that screening's FULL detail
// exactly like the latest summary (photos, questionnaire, advice), fetched by screeningId.
const SeasonHistoryView = ({ student }: { student: BoardStudent }) => {
  const seasons = student.seasonHistory ?? []       // ascending (oldest → newest)
  const ordered = [...seasons].reverse()            // newest-first for the menu
  const [screeningId, setScreeningId] = useState(ordered[0]?.screeningId ?? '')

  const { data: detail, isLoading } = useChildSummary(student.id, screeningId || null)

  if (!ordered.length) return (
    <p className="py-8 text-center text-sm text-text-muted">Өмнөх дүгнэлтийн мэдээлэл байхгүй</p>
  )

  const idx = seasons.findIndex((s) => s.screeningId === screeningId)
  const selected = seasons[idx]
  const prior = idx > 0 ? seasons[idx - 1] : undefined

  const options: DropdownOption[] = ordered.map((s) => ({
    value: s.screeningId,
    label: `${formatSeason(s.seasonId)} · ${formatDayMonthMn(s.screenedAt)}`,
    Icon: TRIAGE_ICON[s.effectiveLevel],
    iconClass: TRIAGE_TEXT[s.effectiveLevel],
  }))

  return (
    <div className="flex flex-col gap-4">
      <Dropdown value={screeningId} options={options} onChange={setScreeningId} ariaLabel="Улирал сонгох" className="w-full" />
      {selected && (
        <StudentSummaryBody
          student={student}
          detail={detail}
          isLoading={isLoading}
          view={{
            level: selected.effectiveLevel,
            screenedAt: selected.screenedAt,
            prior: prior ? { level: prior.effectiveLevel, seasonId: prior.seasonId } : undefined,
          }}
        />
      )}
    </div>
  )
}

export default SeasonHistoryView
