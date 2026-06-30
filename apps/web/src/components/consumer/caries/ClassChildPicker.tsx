'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from '@/components/providers'
import {
  getMyClasses,
  getRosterStatus,
  addStudent,
  type MyClass,
  type RosterChild,
} from '@/lib/screeningApi'
import { ScreeningProgress } from './ScreeningProgress'

/** What the dashboard needs to persist a screening to the DB. */
export type ScreenTarget = {
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  childLabel: string
}

const selectCls =
  'rounded-full border border-border bg-surface-raised px-4 py-2 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-[#52A075]'

/** Улирал → анги → хүүхэд гэсэн тусдаа шүүлтүүрээр сонгоно. Улирал/ангийн шинжилсэн-үлдсэн прогрессийг харуулна. */
export const ClassChildPicker = ({ onChange }: { onChange: (t: ScreenTarget | null) => void }) => {
  const { token } = useSession()
  const [classes, setClasses] = useState<MyClass[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [classId, setClassId] = useState('')
  const [roster, setRoster] = useState<RosterChild[]>([])
  const [adding, setAdding] = useState(false)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [age, setAge] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyClasses(token).then(setClasses).catch(() => setError('Анги уншиж чадсангүй'))
  }, [token])

  // Улирлын жагсаалт (давхцалгүй) ба сонгосон улирлын ангиуд — тусдаа шүүлтүүр.
  const seasons = useMemo(() => [...new Set(classes.map((c) => c.seasonId))], [classes])
  const seasonClasses = useMemo(
    () => classes.filter((c) => c.seasonId === seasonId),
    [classes, seasonId],
  )
  // Улирлын нийт хамрагдалт — тухайн улирлын бүх ангийн нийлбэр. Хуваарь нь ангид
  // тохируулсан "Нийт хүүхэд" (expectedTotal), байхгүй бол бүртгэгдсэн хүүхдийн тоо.
  const seasonTotals = useMemo(
    () =>
      seasonClasses.reduce(
        (a, c) => ({ screened: a.screened + c.screened, total: a.total + (c.expectedTotal || c.enrolled) }),
        { screened: 0, total: 0 },
      ),
    [seasonClasses],
  )

  useEffect(() => {
    onChange(null)
    setAdding(false)
    if (!classId) return setRoster([])
    getRosterStatus(token, classId).then(setRoster).catch(() => setRoster([]))
  }, [classId, token])

  const cls = classes.find((c) => c.id === classId)
  const screenedInClass = roster.filter((r) => r.screenedAt).length

  const emit = (kid: { childKey: string; firstName: string; lastName: string }) => {
    if (!cls) return
    onChange({
      childKey: kid.childKey,
      classId: cls.id,
      schoolId: cls.schoolId,
      seasonId: cls.seasonId,
      childLabel: `${kid.lastName} ${kid.firstName}`.trim() || kid.childKey,
    })
  }

  const handleAdd = async () => {
    if (!cls || !first.trim() || !last.trim() || !age.trim()) return
    setBusy(true)
    setError(null)
    try {
      const birthYear = new Date().getFullYear() - parseInt(age, 10)
      const res = await addStudent(token, classId, { firstName: first.trim(), lastName: last.trim(), birthYear })
      const created = res.children[0]
      if (created) {
        setRoster(await getRosterStatus(token, classId).catch(() => roster))
        emit(created)
        setAdding(false)
        setFirst('')
        setLast('')
        setAge('')
      }
    } catch {
      setError('Хүүхэд нэмэхэд алдаа гарлаа')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={seasonId}
          onChange={(e) => {
            setSeasonId(e.target.value)
            setClassId('')
          }}
          className={selectCls}
          aria-label="Улирал сонгох"
        >
          <option value="">Улирал сонгох…</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {seasonId && (
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={selectCls} aria-label="Анги сонгох">
            <option value="">Анги сонгох…</option>
            {seasonClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.screened}/{c.enrolled})
              </option>
            ))}
          </select>
        )}

        {classId && !adding && (
          <>
            <select
              defaultValue=""
              onChange={(e) => {
                const kid = roster.find((r) => r.childKey === e.target.value)
                if (kid) emit(kid)
              }}
              className={selectCls}
              aria-label="Хүүхэд сонгох"
            >
              <option value="">Хүүхэд сонгох…</option>
              {roster.map((r) => (
                <option key={r.childKey} value={r.childKey}>
                  {r.screenedAt ? '✓ ' : ''}{r.lastName} {r.firstName}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setAdding(true)} className="btn rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-base transition hover:border-primary">
              + Шинэ хүүхэд
            </button>
          </>
        )}
      </div>

      {/* Улирал/ангиар шинжилсэн-үлдсэн хүүхдийн прогресс. */}
      {seasonId && <ScreeningProgress label="Улирал" screened={seasonTotals.screened} total={seasonTotals.total} />}
      {classId && <ScreeningProgress label={cls?.name ?? 'Анги'} screened={screenedInClass} total={cls?.expectedTotal || roster.length} />}

      {classId && adding && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Овог" aria-label="Овог" className={`${selectCls} w-32`} />
          <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Нэр" aria-label="Нэр" className={`${selectCls} w-32`} />
          <input value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} placeholder="Нас" aria-label="Нас" inputMode="numeric" className={`${selectCls} w-20`} />
          <button type="button" disabled={busy || !first.trim() || !last.trim() || !age.trim()} onClick={handleAdd} className="btn rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:opacity-50">
            {busy ? 'Нэмж байна…' : 'Нэмж сонгох'}
          </button>
          <button type="button" onClick={() => setAdding(false)} className="btn rounded-full border border-border bg-surface px-4 py-2 text-[13px] text-text-muted transition hover:border-border">
            Болих
          </button>
        </div>
      )}

      {error && <p className="text-[12px] text-triage-red">{error}</p>}
    </div>
  )
}
