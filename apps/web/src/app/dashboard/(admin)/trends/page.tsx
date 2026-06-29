'use client'

import { useMemo, useState } from 'react'
import { ArrowTrendingUpIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useBoardStudents, type BoardStudent } from '@/hooks/useBoard'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import StudentModal from '@/components/admin/summary/StudentModal'
import TrendColumn from '@/components/admin/trends/TrendColumn'
import { SkeletonKanban } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

type Bucket = 'worsened' | 'treated' | 'normal'

const COLS: { key: Bucket; label: string; dotCls: string; countCls: string }[] = [
  { key: 'worsened', label: 'Хүндрэх эрсдэлтэй',  dotCls: 'bg-triage-red',   countCls: 'bg-triage-red-bg text-triage-red' },
  { key: 'treated',  label: 'Эмчлүүлсэн', dotCls: 'bg-triage-green', countCls: 'bg-triage-green-bg text-triage-green' },
  { key: 'normal',   label: 'Хэвийн',      dotCls: 'bg-border',       countCls: 'bg-surface-raised text-text-muted' },
]

const getBucket = (s: BoardStudent): Bucket => {
  const tag = s.trend?.tag
  const lv = s.latestLevel
  if (tag === 'worsened' || tag === 'deteriorating') return 'worsened'
  if (tag === 'chronic' || tag === 'volatile') return lv === 'green' ? 'normal' : 'worsened'
  if (tag === 'improved' || tag === 'improving') return 'treated'
  return lv === 'green' ? 'normal' : 'worsened'
}

const inp = 'rounded-full border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted/60 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30'
const pill = (active: boolean) => `btn rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${active ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`

const TrendsPage = () => {
  const { data: students, isLoading } = useBoardStudents()
  const [selected, setSelected] = useState<BoardStudent | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')

  useSetPageHeader({ title: 'Улирлын динамик', subtitle: 'Хүүхэд бүрийн карт дээр дарж харьцуулалт харна уу.' })

  const multiSeason = useMemo(
    () => (students ?? []).filter((s) => (s.seasonCount ?? 0) >= 2),
    [students],
  )
  const classes = useMemo(() => [...new Set(multiSeason.map((s) => s.className))].sort(), [multiSeason])

  const filtered = useMemo(() => multiSeason.filter((s) => {
    if (search && !`${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase())) return false
    if (classFilter && s.className !== classFilter) return false
    return true
  }), [multiSeason, search, classFilter])

  const byBucket = useMemo(() => {
    const map: Record<Bucket, BoardStudent[]> = { worsened: [], treated: [], normal: [] }
    for (const s of filtered) map[getBucket(s)].push(s)
    return map
  }, [filtered])

  if (isLoading) return <SkeletonKanban />

  if (multiSeason.length === 0) {
    return <EmptyState Icon={ArrowTrendingUpIcon} title="Өмнөх улирлын дүгнэлт алга" hint="2 ба түүнээс дээш дүгнэлттэй хүүхдүүд энд харагдана." />
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэрээр хайх…" className={`${inp} w-52 pl-9`} />
        </div>

        {classes.length > 1 && (
          <>
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setClassFilter('')} className={pill(classFilter === '')}>Бүх анги</button>
            {classes.map((c) => (
              <button key={c} onClick={() => setClassFilter(c === classFilter ? '' : c)} className={pill(classFilter === c)}>{c}</button>
            ))}
          </>
        )}

        {(search || classFilter) && (
          <Button variant="ghost" size="sm" aria-label="Цэвэрлэх" onClick={() => { setSearch(''); setClassFilter('') }}><TrashIcon className="size-4" /></Button>
        )}
      </div>

      <div className="flex gap-5 overflow-x-auto pb-2">
        {COLS.map((col) => (
          <TrendColumn
            key={col.key}
            meta={col}
            cards={byBucket[col.key]}
            onSelect={setSelected}
          />
        ))}
      </div>

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export default TrendsPage
