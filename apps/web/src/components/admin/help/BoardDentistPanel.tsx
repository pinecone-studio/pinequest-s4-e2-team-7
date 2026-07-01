'use client'

import { useState } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'
import { formatChildName } from '@pinequest/core'
import type { BoardStudent } from '@/hooks/useBoard'
import { useAllVolunteerDentists, type VolunteerDentist } from '@/hooks/useHelp'
import { DentistRosterCard } from './DentistRosterCard'
import ScheduleDentistModal from './ScheduleDentistModal'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import { PageSpinner } from '@/components/ui/Spinner'

type Props = { students: BoardStudent[] }

// Board right-panel: roster of volunteer dentists. Pick a flagged student, then an
// available dentist, to schedule a video call (Jitsi). Mirrors the reference layout.
const BoardDentistPanel = ({ students }: Props) => {
  const { data: dentists = [], isLoading } = useAllVolunteerDentists()
  const [childKey, setChildKey] = useState('')
  const [picked, setPicked] = useState<VolunteerDentist | null>(null)
  const [pickedSlot, setPickedSlot] = useState<Date | null>(null)

  const pick = (d: VolunteerDentist, slot?: Date) => { setPicked(d); setPickedSlot(slot ?? null) }
  const closeModal = () => { setPicked(null); setPickedSlot(null) }

  // Volunteer-dentist calls are for RED (emergency) students only.
  const redStudents = students.filter((s) => s.latestLevel === 'red')
  const selected = redStudents.find((s) => s.childKey === childKey) ?? null
  const student = selected ? { childKey: selected.childKey, name: formatChildName(selected) } : null

  // Same shared Dropdown every other admin picker uses → consistent look.
  const studentOptions: DropdownOption[] = [
    { value: '', label: 'Сурагчийн нэрс сонгох', Icon: UserIcon },
    ...redStudents.map((s) => ({ value: s.childKey, label: `${formatChildName(s)} · ${s.className}`, Icon: UserIcon })),
  ]

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-4 lg:sticky lg:top-4 lg:h-[calc(100dvh-8rem)] lg:w-110">
      <div>
        <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-text-base">
          Танд туслах боломжтой шүдний эмч
          <span className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-text-muted">{dentists.length}</span>
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">Эмчийг сонгоно уу.</p>
      </div>

      <Dropdown
        value={childKey}
        options={studentOptions}
        onChange={setChildKey}
        ariaLabel="Сурагчийн нэрс сонгох"
        className="w-full"
      />

      {isLoading ? (
        <PageSpinner />
      ) : dentists.length > 0 ? (
        <div className="flex max-h-[70vh] flex-col gap-2.5 overflow-y-auto pr-0.5 lg:max-h-none lg:min-h-0 lg:flex-1">
          {dentists.map((d) => (
            <DentistRosterCard key={d.id} dentist={d} onPick={(slot) => pick(d, slot)} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[12px] text-text-muted">
          Дуудлага хийх боломжтой эмч алга байна.
        </p>
      )}

      {!student && dentists.length > 0 && (
        <p className="text-[11px] text-text-muted">Дуудлага хийх товлосон цагийг асран хамгаалагчид мэдэгдэнэ үү.</p>
      )}

      {picked && (
        <ScheduleDentistModal dentist={picked} student={student} level="red" initialSlot={pickedSlot} onClose={closeModal} />
      )}
    </aside>
  )
}

export default BoardDentistPanel
