'use client'

import { useMemo, useState } from 'react'
import type { FollowUpStatus } from '@pinequest/types'
import { useBoardStudents, useSendToParent, useSetFollowUpStatus, type BoardStudent } from '@/hooks/useBoard'
import KanbanColumn from '@/components/admin/follow-up/KanbanColumn'
import FollowUpEditModal from '@/components/admin/follow-up/FollowUpEditModal'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonKanban } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import {
  ClipboardDocumentListIcon, MagnifyingGlassIcon, AcademicCapIcon,
  ExclamationTriangleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

type Column = { status: FollowUpStatus; label: string; dot: string; count: string; statuses: FollowUpStatus[] }
const COLUMNS: Column[] = [
  { status: 'flagged',        label: 'Шинэ',         dot: 'bg-fu-flagged',   count: 'bg-fu-flagged-bg text-fu-flagged',     statuses: ['flagged'] },
  { status: 'contacted',      label: 'Хяналтад',     dot: 'bg-fu-contacted', count: 'bg-fu-contacted-bg text-fu-contacted', statuses: ['contacted', 'doctor_connected', 'unclear'] },
  { status: 'treatment_done', label: 'Шийдвэрлэсэн', dot: 'bg-fu-done',      count: 'bg-fu-done-bg text-fu-done',           statuses: ['treatment_done', 'treatment_refused'] },
]
const columnFor = (st: FollowUpStatus): Column => COLUMNS.find((c) => c.statuses.includes(st)) ?? COLUMNS[0]

const PAGE_SIZE = 5
const inp = 'rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted/60 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30'
const LEVEL_OPTS: DropdownOption[] = [
  { value: '', label: 'Бүх эрэмбэ' },
  { value: 'red',    label: 'Яаралтай', Icon: ExclamationTriangleIcon, iconClass: 'text-triage-red' },
  { value: 'yellow', label: 'Хяналт',   Icon: ExclamationCircleIcon,  iconClass: 'text-triage-yellow' },
]
const URGENCY: Record<string, number> = { red: 0, yellow: 1 }
const byUrgency = (a: BoardStudent, b: BoardStudent) => {
  const u = (URGENCY[a.latestLevel ?? ''] ?? 9) - (URGENCY[b.latestLevel ?? ''] ?? 9)
  return u !== 0 ? u : new Date(b.screenedAt ?? 0).getTime() - new Date(a.screenedAt ?? 0).getTime()
}

const FollowUpBoard = () => {
  const { data: students, isLoading } = useBoardStudents()
  const send = useSendToParent()
  const setStatus = useSetFollowUpStatus()
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<FollowUpStatus | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [colPages, setColPages] = useState<Record<string, number>>(
    () => Object.fromEntries(COLUMNS.map((c) => [c.status, PAGE_SIZE]))
  )

  const flagged = useMemo(
    () => (students ?? []).filter((s) => s.latestLevel === 'red' || s.latestLevel === 'yellow'),
    [students],
  )
  const classes = useMemo(() => [...new Set(flagged.map((s) => s.className))].sort(), [flagged])
  const classOptions: DropdownOption[] = [
    { value: '', label: 'Бүх анги', Icon: AcademicCapIcon },
    ...classes.map((c) => ({ value: c, label: c })),
  ]

  const filtered = useMemo(() => flagged.filter((s) => {
    if (search && !`${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase())) return false
    if (classFilter && s.className !== classFilter) return false
    if (levelFilter && s.latestLevel !== levelFilter) return false
    return true
  }), [flagged, search, classFilter, levelFilter])

  const byStatus = useMemo(() => {
    const map: Record<string, BoardStudent[]> = {}
    for (const col of COLUMNS) map[col.status] = []
    for (const s of filtered) map[columnFor(s.followUpStatus ?? 'flagged').status].push(s)
    for (const col of COLUMNS) map[col.status].sort(byUrgency)
    return map
  }, [filtered])

  const onDrop = (targetStatus: FollowUpStatus) => {
    if (draggingKey) setStatus.mutate({ childKey: draggingKey, status: targetStatus })
    setDraggingKey(null); setDragOverCol(null)
  }

  return (
    <section className="flex min-h-0 flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Хяналт</h1>
        <p className="text-sm text-text-muted">Нийт {flagged.length} сурагч · Хамгийн яаралтай тусламж шаардлагатай хүүхэд нь эхэнд харагдана.</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэрээр хайх…" className={`${inp} pl-9 w-full`} />
        </div>
        <Dropdown value={classFilter} options={classOptions} onChange={setClassFilter} ariaLabel="Ангиар шүүх" className="w-44" />
        <Dropdown value={levelFilter} options={LEVEL_OPTS} onChange={setLevelFilter} ariaLabel="Эрэмбээр шүүх" className="w-40" />
        {(search || classFilter || levelFilter) && (
          <Button variant="outline" onClick={() => { setSearch(''); setClassFilter(''); setLevelFilter('') }}>Цэвэрлэх</Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonKanban />
      ) : flagged.length === 0 ? (
        <EmptyState Icon={ClipboardDocumentListIcon} title="Хяналт шаардлагатай сурагч алга" hint="Улаан/шар төлөвтэй сурагч гарвал энд харагдана." />
      ) : (
        <div className="flex gap-5 overflow-x-auto px-0.5 pb-2">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              col={col}
              cards={byStatus[col.status] ?? []}
              limit={colPages[col.status] ?? PAGE_SIZE}
              pageSize={PAGE_SIZE}
              isOver={dragOverCol === col.status}
              draggingKey={draggingKey}
              onDragOver={() => setDragOverCol(col.status)}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null) }}
              onDrop={() => onDrop(col.status)}
              onSend={(s) => { void send(s).catch(() => {}) }}
              onStatus={(childKey, st) => setStatus.mutate({ childKey, status: st })}
              onEdit={setEditing}
              onDragStart={setDraggingKey}
              onDragEnd={() => { setDraggingKey(null); setDragOverCol(null) }}
              onShowMore={() => setColPages((p) => ({ ...p, [col.status]: (p[col.status] ?? PAGE_SIZE) + PAGE_SIZE }))}
              onCollapse={() => setColPages((p) => ({ ...p, [col.status]: PAGE_SIZE }))}
            />
          ))}
        </div>
      )}

      <FollowUpEditModal student={editing} onClose={() => setEditing(null)} />
    </section>
  )
}

export default FollowUpBoard
