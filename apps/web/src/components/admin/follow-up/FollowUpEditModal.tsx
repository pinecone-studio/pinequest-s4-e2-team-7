'use client'

import { useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import type { BoardStudent, FollowUpUpdateVars } from '@/hooks/useBoard'
import { useChildSummary } from '@/hooks/useChildSummary'
import { useSetFollowUpStatus, useSendToParent } from '@/hooks/useBoard'
import { formatChildName } from '@pinequest/core'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StudentSummaryBody from '@/components/admin/summary/StudentSummaryBody'
import { VolunteerDentistSection } from '@/components/admin/help/VolunteerDentistSection'
import { formatSeason } from '@/lib/season'

type Props = { student: BoardStudent | null; onClose: () => void }
type Tab = 'summary' | 'action'
const TABS: [Tab, string][] = [['summary', 'Дүгнэлт'], ['action', 'Хяналт']]

// Two tabs keep the modal short: "Дүгнэлт" = clinical reference, "Хяналт" = the
// booking + status action. Red children open straight on the action tab.
const FollowUpEditModal = ({ student, onClose }: Props) => {
  const setStatus = useSetFollowUpStatus()
  const send = useSendToParent()
  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)

  const isRed = student?.latestLevel === 'red'
  const [tab, setTab] = useState<Tab>(isRed ? 'action' : 'summary')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [notes, setNotes] = useState('')

  if (!student) return null

  // Teachers book a time + leave a note; the status itself is set by the dentist,
  // so we keep the child's current status unchanged here.
  const handleSave = () => {
    const vars: FollowUpUpdateVars = {
      childKey: student.childKey,
      status: student.followUpStatus ?? 'flagged',
      ...(appointmentDate && { appointmentAt: new Date(appointmentDate).toISOString() }),
      ...(notes.trim() && { notes: notes.trim() }),
    }
    setStatus.mutate(vars)
    onClose()
  }

  const field = 'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base'
  const fieldLabel = 'mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted'

  return (
    <Modal
      open onClose={onClose}
      title={formatChildName(student)}
      subtitle={`${student.className} · ${formatSeason(student.seasonId)}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
          <Button
            variant="secondary"
            onClick={() => { void send(student).catch(() => {}); onClose() }}
            disabled={!student.guardianEmail && !student.guardianPhone}
          >
            <EnvelopeIcon className="size-4" />Мсж илгээх
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={setStatus.isPending}>Хадгалах</Button>
        </>
      }
    >
      <div className="mb-4 flex rounded-full bg-surface-raised p-1">
        {TABS.map(([t, label]) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`btn flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-all duration-150 ${
              tab === t ? 'bg-surface text-text-base shadow-(--shadow-card)' : 'text-text-muted hover:text-text-base'
            }`}
          >{label}</button>
        ))}
      </div>

      {tab === 'summary' && <StudentSummaryBody student={student} detail={detail} isLoading={isLoading} />}

      {tab === 'action' && (
        <div className="flex flex-col gap-5">
          {isRed && <VolunteerDentistSection student={student} detail={detail ?? undefined} />}
          <div className="space-y-4">
            <div>
              <p className={fieldLabel}>Цаг товлох</p>
              <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className={field} />
            </div>
            <div>
              <p className={fieldLabel}>Тэмдэглэл</p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Тэмдэглэл..." className={`${field} resize-none`} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default FollowUpEditModal
