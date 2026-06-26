'use client'

import { EnvelopeIcon } from '@heroicons/react/24/outline'
import type { BoardStudent } from '@/hooks/useBoard'
import { useChildSummary } from '@/hooks/useChildSummary'
import { useSetFollowUpStatus, useSendToParent } from '@/hooks/useBoard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StatusPicker from '@/components/ui/StatusPicker'
import StudentSummaryBody from '@/components/admin/summary/StudentSummaryBody'

// Summary + editable follow-up status. Shares its body with StudentModal.
type Props = { student: BoardStudent | null; onClose: () => void }

const FollowUpEditModal = ({ student, onClose }: Props) => {
  const setStatus = useSetFollowUpStatus()
  const send = useSendToParent()
  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)
  if (!student) return null

  return (
    <Modal
      open onClose={onClose}
      title={`${student.lastName} ${student.firstName}`}
      subtitle={`${student.className} · ${student.seasonId}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
          <Button
            variant="primary"
            onClick={() => { void send(student).catch(() => {}); onClose() }}
            disabled={!student.guardianEmail && !student.guardianPhone}
          >
            <EnvelopeIcon className="size-4" />Асран хамгаалагч руу мсж илгээх
          </Button>
        </>
      }
    >
      <StudentSummaryBody
        student={student}
        detail={detail}
        isLoading={isLoading}
        statusSlot={
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Хяналтын төлөв</p>
            <StatusPicker
              value={student.followUpStatus ?? 'flagged'}
              onChange={(st) => setStatus.mutate({ childKey: student.childKey, status: st })}
            />
          </div>
        }
      />
    </Modal>
  )
}

export default FollowUpEditModal
