'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { School } from '@pinequest/types'
import { usePatchSchool } from '@/hooks/useSchools'
import Card from '@/components/ui/Card'

const iconBtn = 'btn flex size-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-raised hover:text-text-base'

// One cohort (school) row with live inline rename + archive-with-confirm.
const CohortCard = ({ school }: { school: School }) => {
  const patch = usePatchSchool()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(school.name)
  const [confirmDel, setConfirmDel] = useState(false)
  const busy = patch.isPending

  const save = () => {
    const next = name.trim()
    if (next && next !== school.name) patch.mutate({ id: school.id, name: next })
    setEditing(false)
  }
  const cancel = () => { setName(school.name); setEditing(false) }

  return (
    <Card className="group flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-[12px] font-bold text-primary">
        {school.name.slice(0, 2).toUpperCase()}
      </div>

      {editing ? (
        <input
          autoFocus value={name} disabled={busy}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          className="min-w-0 flex-1 rounded-lg border border-primary bg-surface px-2 py-1 text-[13px] text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <Link href={`/dashboard/admin/schools/${school.id}`} className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-base hover:text-primary">
          {school.name}
        </Link>
      )}

      {confirmDel ? (
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[11px] font-medium text-triage-red">Архивлах?</span>
          <button onClick={() => patch.mutate({ id: school.id, isActive: false })} disabled={busy} aria-label="Тийм" className={`${iconBtn} text-triage-red hover:bg-triage-red-bg`}><CheckIcon className="size-4" /></button>
          <button onClick={() => setConfirmDel(false)} aria-label="Болих" className={iconBtn}><XMarkIcon className="size-4" /></button>
        </div>
      ) : editing ? (
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={save} disabled={busy} aria-label="Хадгалах" className={`${iconBtn} text-triage-green hover:bg-triage-green-bg`}><CheckIcon className="size-4" /></button>
          <button onClick={cancel} aria-label="Болих" className={iconBtn}><XMarkIcon className="size-4" /></button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => setEditing(true)} aria-label="Засах" className={iconBtn}><PencilSquareIcon className="size-4" /></button>
          <button onClick={() => setConfirmDel(true)} aria-label="Архивлах" className={iconBtn}><TrashIcon className="size-4" /></button>
        </div>
      )}
    </Card>
  )
}

export default CohortCard
