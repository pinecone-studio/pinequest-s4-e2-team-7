'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useCarryForward, useClasses, useCreateClass } from '@/hooks/useClasses'
import { useSchool } from '@/hooks/useSchools'
import { useStats } from '@/hooks/useStats'
import CoverageBar from '@/components/CoverageBar'

const inp = 'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const SchoolClassesPage = () => {
  const schoolId = useParams().schoolId as string
  const { data: school } = useSchool(schoolId)
  const { data: classes, isLoading } = useClasses(schoolId)
  const { data: stats } = useStats({ schoolId })
  const createClass = useCreateClass(schoolId)
  const carryForward = useCarryForward(schoolId)
  const [name, setName] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createClass.mutate({ name: name.trim(), seasonId })
    setName('')
  }

  const onCarry = (classId: string) => {
    const newSeasonId = window.prompt('Шинэ улирлын нэр (ж: 2027-spring)')
    if (newSeasonId) carryForward.mutate({ classId, newSeasonId })
  }

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-primary hover:underline">← Сургуулиуд</Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">
        {school?.name ?? '…'}
        {school?.district && <span className="ml-2 text-base font-normal text-text-muted">{school.district}</span>}
      </h1>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {(['green', 'yellow', 'red'] as const).map((lvl) => (
            <div key={lvl} className={`rounded-xl border p-3 text-center ${lvl === 'green' ? 'border-triage-green bg-triage-green-bg' : lvl === 'yellow' ? 'border-triage-yellow bg-triage-yellow-bg' : 'border-triage-red bg-triage-red-bg'}`}>
              <p className={`text-2xl font-bold ${lvl === 'green' ? 'text-triage-green' : lvl === 'yellow' ? 'text-triage-yellow' : 'text-triage-red'}`}>{stats.triage[lvl]}</p>
              <p className="text-xs text-text-muted">{lvl === 'green' ? 'Аюулгүй' : lvl === 'yellow' ? 'Шалгуулах' : 'Яаралтай'}</p>
            </div>
          ))}
          <div className="col-span-3 rounded-xl border border-border bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-text-muted">Хамрагдалт</p>
            <CoverageBar screened={stats.coverage.screened} total={stats.coverage.total} />
          </div>
        </div>
      )}

      <form onSubmit={onAdd} className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ангийн нэр (ж: 3А)" className={inp} />
        <input value={seasonId} onChange={(e) => setSeasonId(e.target.value)} placeholder="Улирал" className={inp} />
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-hover transition-colors">Нэмэх</button>
      </form>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {classes?.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-(--shadow-card)">
              <Link href={`/admin/classes/${c.id}`} className="flex-1 text-sm font-medium text-text-base hover:text-primary">
                {c.name} <span className="font-normal text-text-muted">· {c.seasonId}</span>
              </Link>
              <button onClick={() => onCarry(c.id)} className="text-xs text-text-muted hover:text-primary hover:underline">
                Дараа улирал →
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SchoolClassesPage
