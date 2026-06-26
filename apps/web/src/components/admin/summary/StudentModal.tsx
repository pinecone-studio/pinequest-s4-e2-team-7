'use client'

import { EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StudentSummaryBody from './StudentSummaryBody'
import { useChildSummary } from '@/hooks/useChildSummary'
import { openParentEmail, openParentSms } from '@/lib/parentEmail'
import { printChildSummary } from '@/lib/parentPdf'
import type { BoardStudent } from '@/hooks/useBoard'

const StudentModal = ({ student, onClose }: { student: BoardStudent | null; onClose: () => void }) => {
  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)
  if (!student) return null

  const name = `${student.lastName} ${student.firstName}`
  const summary = detail?.summary
  const hasEmail = !!student.guardianEmail
  const hasPhone = !!student.guardianPhone

  return (
    <Modal
      open onClose={onClose} title={name}
      subtitle={`${student.className} · ${student.seasonId}`}
      size="lg"
      footer={
        <div className="flex w-full items-center gap-2">
          {/* Send options — optional: only enabled when contact exists */}
          <button
            type="button"
            disabled={!summary}
            onClick={() => summary && printChildSummary(name, summary, detail?.imageRefs ?? [], detail?.hospital)}
            title="PDF үзэх / хэвлэх"
            className="btn flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          >
            <DocumentTextIcon className="size-4" />
          </button>
          <button
            type="button"
            disabled={!summary || !hasPhone}
            onClick={() => summary && hasPhone && openParentSms(student.guardianPhone!, name, summary)}
            title={hasPhone ? 'SMS илгээх' : 'Утасны дугаар байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PhoneIcon className="size-4" />
          </button>
          <button
            type="button"
            disabled={!summary || !hasEmail}
            onClick={() => summary && hasEmail && openParentEmail(name, student.guardianEmail, summary, detail?.hospital)}
            title={hasEmail ? 'И-мэйл илгээх' : 'И-мэйл хаяг байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          >
            <EnvelopeIcon className="size-4" />
          </button>

          <span className="flex-1" />
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
        </div>
      }
    >
      <StudentSummaryBody student={student} detail={detail} isLoading={isLoading} />
    </Modal>
  )
}

export default StudentModal
