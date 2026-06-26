'use client'

import { useMemo, useState } from 'react'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import type { TriageLevel } from '@pinequest/types'
import { useBoardStudents, type BoardStudent } from '@/hooks/useBoard'
import Card from '@/components/ui/Card'
import StatusPill, { type Tone } from '@/components/ui/StatusPill'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import StudentModal from '@/components/admin/summary/StudentModal'

const CATS: { level: TriageLevel; label: string; tone: Tone; ink: string; avatar: string }[] = [
  { level: 'red', label: 'Улаан  /яаралтай эмчид үзүүлж, эмчилгээг эхлэх/', tone: 'danger', ink: 'text-triage-red', avatar: 'bg-triage-red-bg' },
  { level: 'yellow', label: 'Шар /ойрын хугацаанд эмчлүүлэх/', tone: 'check', ink: 'text-triage-yellow', avatar: 'bg-triage-yellow-bg' },
  { level: 'green', label: 'Ногоон /дараагийн улиралд дахин хянах/', tone: 'safe', ink: 'text-triage-green', avatar: 'bg-triage-green-bg' },
]

const StatusPage = () => {
  const { data: students, isLoading } = useBoardStudents()
  const [selected, setSelected] = useState<BoardStudent | null>(null)

  const groups = useMemo(() => {
    const by: Record<string, BoardStudent[]> = { red: [], yellow: [], green: [], none: [] }
    for (const s of students ?? []) by[s.latestLevel ?? 'none'].push(s)
    return by
  }, [students])

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Статус</h1>
       
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} rows={4} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATS.map((cat) => {
            const list = groups[cat.level]
            return (
              <Card key={cat.level} pad={false} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <StatusPill tone={cat.tone} variant="soft">{cat.label}</StatusPill>
                  <span className={`text-[20px] font-bold leading-none ${cat.ink}`}>{list.length}</span>
                </div>
                <div className="flex max-h-[62vh] flex-col gap-1.5 overflow-y-auto p-3">
                  {list.length === 0 ? (
                    <EmptyState compact Icon={ClipboardDocumentCheckIcon} title="Хоосон" />
                  ) : (
                    list.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className="btn flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-raised"
                      >
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${cat.avatar} ${cat.ink}`}>{s.lastName.charAt(0)}</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-base">{s.lastName} {s.firstName}</span>
                        <span className="shrink-0 text-[11px] text-text-muted">{s.className}</span>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {groups.none.length > 0 && <p className="text-[12px] text-text-muted">Шалгагдаагүй: {groups.none.length} сурагч</p>}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export default StatusPage
