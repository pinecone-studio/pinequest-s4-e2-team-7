'use client'

import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useBoardStudents, useSendToParent, useDeleteChild, useSetFollowUpStatus, type BoardStudent } from '@/hooks/useBoard'
import { useToast } from '@/components/ui/Toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import StudentGrid from '@/components/admin/summary/StudentGrid'
import StudentModal from '@/components/admin/summary/StudentModal'
import StudentEditModal from '@/components/admin/summary/StudentEditModal'
import EmptyState from '@/components/ui/EmptyState'

const SummaryBoard = () => {
  const { data: students, isLoading } = useBoardStudents()
  const send = useSendToParent()
  const del = useDeleteChild()
  const setStatus = useSetFollowUpStatus()
  const toast = useToast()
  const [selected, setSelected] = useState<BoardStudent | null>(null)
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [deleting, setDeleting] = useState<BoardStudent | null>(null)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const all = students ?? []
    if (!needle) return all
    return all.filter((s) => `${s.lastName} ${s.firstName} ${s.className}`.toLowerCase().includes(needle))
  }, [students, q])

  const handleSend = async (s: BoardStudent) => {
    try {
      await send(s)
      toast.success(`${s.lastName}-д мэдэгдэл илгээлээ`)
    } catch {
      toast.error('Илгээхэд алдаа гарлаа')
    }
  }

  const handleDelete = () => {
    if (!deleting) return
    del.mutate(deleting.id, { onSettled: () => setDeleting(null) })
  }

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-base">Дүгнэлт</h1>
          <p className="text-sm text-text-muted">Бүх сурагч ({students?.length ?? 0}) — карт дээр дарж дэлгэрэнгүйг үзнэ.</p>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Нэр, ангиар хайх…"
            aria-label="Сурагч хайх"
            className="w-64 rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState Icon={UsersIcon} title="Сурагч олдсонгүй" hint="Хайлтаа өөрчилж үзнэ үү." />
      ) : (
        <StudentGrid
          students={filtered}
          onSelect={setSelected}
          onSend={(s) => { void handleSend(s) }}
          onEdit={setEditing}
          onDelete={setDeleting}
          onStatus={(s, status) => {
            setStatus.mutate({ childKey: s.childKey, status })
          }}
        />
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
      <StudentEditModal key={editing?.id ?? 'none'} student={editing} onClose={() => setEditing(null)} />

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isPending={del.isPending}
        title="Сурагч устгах"
        message={deleting ? `${deleting.lastName} ${deleting.firstName}-г жагсаалтаас хасах уу? Энэ үйлдлийг буцааж болохгүй.` : ''}
      />
    </section>
  )
}

export default SummaryBoard
