'use client'

import StudentCard from './StudentCard'
import type { BoardStudent } from '@/hooks/useBoard'

type Props = {
  students: BoardStudent[]
  onSelect: (s: BoardStudent) => void
  onSend?: (s: BoardStudent) => void
  onEdit?: (s: BoardStudent) => void
  onDelete?: (s: BoardStudent) => void
}

/** Vertical column of rich, live student cards (color-coded by triage level). */
const StudentGrid = ({ students, onSelect, onSend, onEdit, onDelete }: Props) => (
  <div className="flex flex-col gap-3">
    {students.map((s, i) => (
      <div key={s.id} className="list-in" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
        <StudentCard
          student={s}
          onOpen={() => onSelect(s)}
          onSend={onSend ? () => onSend(s) : undefined}
          onEdit={onEdit ? () => onEdit(s) : undefined}
          onDelete={onDelete ? () => onDelete(s) : undefined}
        />
      </div>
    ))}
  </div>
)

export default StudentGrid
