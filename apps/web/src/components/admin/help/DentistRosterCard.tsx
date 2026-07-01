'use client'

import { useMemo } from 'react'
import { ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { useDentistSlots } from '@/hooks/useAppointments'
import { buildSlots, slotLabel } from '@/lib/appointmentSlots'

type Props = { dentist: VolunteerDentist; onPick: (slot?: Date) => void; disabled?: boolean }

const initialsOf = (name: string) =>
  name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)

// Roster card for the board's dentist panel: identity header + call button, with the
// dentist's next available times beneath. Booked or dentist-blocked slots render
// inactive; tapping a free slot opens the schedule modal on that time.
export const DentistRosterCard = ({ dentist, onPick, disabled }: Props) => {
  const available = dentist.isAvailable
  const clickable = available && !disabled
  const slots = useMemo(() => buildSlots(), [])
  const { data: taken = [] } = useDentistSlots(dentist.id)
  const unavail = useMemo(() => new Map(taken.map((t) => [t.scheduledAt, t.kind])), [taken])

  // Always show a role + experience line so a sparse profile (no specialty/years) still reads as complete.
  const role = dentist.specialty ?? dentist.org ?? dentist.area ?? 'Сайн дурын эмч'
  const exp = dentist.experienceYears != null ? `${dentist.experienceYears} жил туршлага` : 'Бүртгэлтэй эмч'

  return (
    <div className={`flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-4 transition ${clickable ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-3">
        <div className="relative size-14 shrink-0">
          {dentist.avatarUrl ? (
            <img src={dentist.avatarUrl} alt={dentist.displayName} className="size-14 rounded-full object-cover ring-1 ring-border" />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-subtle text-[15px] font-bold text-primary">{initialsOf(dentist.displayName)}</div>
          )}
          <span className={`absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-surface ${available ? 'bg-triage-green' : 'bg-text-muted'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-text-base">{dentist.displayName}</p>
          <p className="mt-0.5 truncate text-[12.5px] text-text-muted">{role}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-text-muted">
            <ClockIcon className="size-3 shrink-0" />
            <span className="truncate">{exp}</span>
            <span aria-hidden className="opacity-40">·</span>
            <span className={available ? 'font-medium text-triage-green' : ''}>{available ? 'Боломжтой' : 'Боломжгүй'}</span>
          </div>
        </div>

        {available && (
          <button
            type="button"
            onClick={() => onPick()}
            disabled={!clickable}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-triage-red px-3.5 py-2 text-[12px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <VideoCameraIcon className="size-3.5" /> Холбогдох
          </button>
        )}
      </div>

      {available && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-[11px] font-medium text-text-muted">Боломжит цаг сонгох</p>
          <div className="flex flex-wrap gap-1.5">
            {slots.map((d) => {
              const kind = unavail.get(d.getTime())
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={!!kind}
                  onClick={() => onPick(d)}
                  title={kind === 'booked' ? 'Захиалагдсан' : kind === 'blocked' ? 'Эмч хаасан цаг' : 'Энэ цагт захиалах'}
                  className={`rounded-full border px-2.5 py-1.5 text-[11.5px] font-medium transition ${
                    kind
                      ? 'cursor-not-allowed border-border bg-surface-raised text-text-muted line-through opacity-60'
                      : 'border-border bg-surface text-text-base hover:border-primary hover:text-primary'
                  }`}
                >
                  {slotLabel(d)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
