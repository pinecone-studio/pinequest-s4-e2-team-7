'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/components/providers'
import { updateClassTotal } from '@/lib/screeningApi'

/** Inline "Нийт хүүхэд" (total kids to evaluate) editor for the selected class.
 *  Saves the class's expectedTotal — the denominator behind Хамрагдсан/Үлдсэн. */
export const ClassTotalEditor = ({
  classId,
  value,
  onSaved,
}: {
  classId: string
  value: number | null
  onSaved: (n: number) => void
}) => {
  const { token } = useSession()
  const [text, setText] = useState(value?.toString() ?? '')
  const [busy, setBusy] = useState(false)
  useEffect(() => setText(value?.toString() ?? ''), [value, classId])

  const n = parseInt(text, 10)
  const valid = Number.isFinite(n) && n > 0
  const dirty = valid && n !== value

  const save = async () => {
    if (!valid || busy) return
    setBusy(true)
    try {
      await updateClassTotal(token, classId, n)
      onSaved(n)
    } catch {
      /* keep the field editable so the user can retry */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="whitespace-nowrap text-[12px] font-semibold text-text-muted">Нийт хүүхэд</label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        inputMode="numeric"
        aria-label="Нийт хүүхэд"
        placeholder="—"
        className="w-16 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-primary"
      />
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="btn rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
        >
          {busy ? 'Хадгалж…' : 'Хадгалах'}
        </button>
      )}
    </div>
  )
}
