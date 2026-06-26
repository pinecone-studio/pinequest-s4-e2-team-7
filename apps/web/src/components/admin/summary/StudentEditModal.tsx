'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useUpdateChild, type BoardStudent } from '@/hooks/useBoard'

// Parent should pass key={student.id} so fields re-init per student.
const StudentEditModal = ({ student, onClose }: { student: BoardStudent | null; onClose: () => void }) => {
  const update = useUpdateChild()
  const [firstName, setFirstName] = useState(student?.firstName ?? '')
  const [lastName, setLastName] = useState(student?.lastName ?? '')
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone ?? '')
  const [guardianEmail, setGuardianEmail] = useState(student?.guardianEmail ?? '')
  if (!student) return null

  const inp = 'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'
  const save = () => update.mutate(
    { id: student.id, firstName, lastName, guardianPhone: guardianPhone || undefined, guardianEmail: guardianEmail || undefined },
    { onSuccess: onClose },
  )

  return (
    <Modal
      open onClose={onClose} title="Сурагч засах" subtitle={`${student.className} · №${student.rosterSlot}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Болих</Button>
          <Button variant="primary" onClick={save} loading={update.isPending}>Хадгалах</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Овог" className={inp} />
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Нэр" className={inp} />
        <input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="Эцэг эхийн утас" className={`${inp} col-span-2`} />
        <input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="Эцэг эхийн и-мэйл" type="email" className={`${inp} col-span-2`} />
      </div>
    </Modal>
  )
}

export default StudentEditModal
