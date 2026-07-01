'use client'

import { useState, useEffect } from 'react'
import { EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '@heroicons/react/24/solid'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StudentSummaryBody from './StudentSummaryBody'
import SeasonHistoryView from './SeasonHistoryView'
import SeasonTrendChart from './SeasonTrendChart'
import { useChildSummary } from '@/hooks/useChildSummary'
import { useSession } from '@/components/providers'
import { openParentEmail, openParentSms } from '@/lib/parentEmail'
import { printChildSummary } from '@/lib/parentPdf'
import type { BoardStudent } from '@/hooks/useBoard'
import { formatChildName } from '@pinequest/core'
import { formatSeason } from '@/lib/season'

type Tab = 'latest' | 'history' | 'chart'
const TAB_LABELS: Record<Tab, string> = { latest: 'Сүүлийн дүгнэлт', history: 'Өмнөх дүгнэлтүүд', chart: 'Динамик өөрчлөлтүүд' }

const StudentModal = ({ student, onClose }: { student: BoardStudent | null; onClose: () => void }) => {
  const [tab, setTab] = useState<Tab>('latest')
  useEffect(() => { setTab('latest') }, [student?.childKey])

  const { token } = useSession()
  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)
  if (!student) return null

  const name = formatChildName(student)
  const summary = detail?.summary
  const hasEmail = !!student.guardianEmail
  const hasPhone = !!student.guardianPhone

  return (
    <Modal
      open onClose={onClose} title={name}
      subtitle={`${student.className} · ${formatSeason(student.seasonId)}`}
      size="lg"
      footer={
        <div className="flex w-full items-center gap-2">
          <button
            type="button" disabled={!summary}
            onClick={() => detail?.summary && printChildSummary(name, detail, token)}
            title="PDF үзэх/хэвлэх"
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><DocumentTextIcon className="size-4" /></button>
          <button
            type="button" disabled={!summary || !hasPhone}
            onClick={() => summary && hasPhone && openParentSms(student.guardianPhone!, name, summary)}
            title={hasPhone ? 'SMS илгээх' : 'Утасны дугаар байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><PhoneIcon className="size-4" /></button>
          <button
            type="button" disabled={!summary || !hasEmail}
            onClick={() => summary && hasEmail && openParentEmail(name, student.guardianEmail, summary, detail?.hospital)}
            title={hasEmail ? 'И-мэйл илгээх' : 'И-мэйл хаяг байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><EnvelopeIcon className="size-4" /></button>
          <span className="flex-1" />
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
        </div>
      }
    >
      <div className="mb-4 flex rounded-full bg-surface-raised p-1">
        {(['latest', 'history', 'chart'] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`btn flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-all duration-150 ${
              tab === t ? 'bg-surface text-text-base shadow-(--shadow-card)' : 'text-text-muted hover:text-text-base'
            }`}
          >{TAB_LABELS[t]}</button>
        ))}
      </div>
      {tab === 'latest' && <StudentSummaryBody student={student} detail={detail} isLoading={isLoading} />}
      {tab === 'history' && <SeasonHistoryView student={student} />}
      {tab === 'chart' && <SeasonTrendChart history={student.seasonHistory ?? []} />}
    </Modal>
  )
}

export default StudentModal
