'use client'

import { CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { useMyAppointments, type AppointmentRow } from '@/hooks/useAppointments'
import PlayCard from '@/components/ui/PlayCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }
const fmtDay = (ms: number) => new Date(ms).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

// Red/yellow accent bar keeps the triage priority legible at a glance.
const LEVEL_BAR: Record<string, string> = { red: 'bg-triage-red', yellow: 'bg-triage-yellow' }

// One booked dentist call — the only fields that matter: who, with which dentist, when.
const AppointmentLine = ({ a }: { a: AppointmentRow }) => (
  <div className="flex items-center gap-3 border-t border-border-muted py-2.5 first:border-t-0">
    {a.status === 'completed'
      ? <CheckCircleIcon className="size-5 shrink-0 text-triage-green" title="Дууссан" />
      : <span className={`h-9 w-1 shrink-0 rounded-full ${LEVEL_BAR[a.level] ?? 'bg-primary'}`} />}
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-bold text-text-base">{a.childName ?? '—'}</p>
      <p className="truncate text-[11px] text-text-muted">{a.dentistName ? `${a.dentistName} эмч` : 'Эмч товлоогүй'}</p>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-[12px] font-semibold tabular-nums text-text-base">{fmtDay(a.scheduledAt)}</p>
      <p className="text-[10px] tabular-nums text-text-muted">{fmtTime(a.scheduledAt)}</p>
    </div>
  </div>
)

// The dashboard's "who booked time with a dentist" schedule — child + dentist + time.
const UpcomingAppointmentsList = () => {
  const { data, isLoading } = useMyAppointments()
  if (isLoading) return <SkeletonCard rows={3} />

  const from = startOfToday()
  const upcoming = (data ?? [])
    .filter((a) => a.status !== 'cancelled' && a.scheduledAt >= from)
    .sort((a, b) => a.scheduledAt - b.scheduledAt)
    .slice(0, 5)

  return (
    <PlayCard tone="surface" delay={4} grow={false} className="flex flex-col xl:min-h-0">
      <h2 className="mb-3 text-[15px] font-semibold text-text-base">Эмчтэй товлосон цаг</h2>
      {upcoming.length === 0 ? (
        <EmptyState Icon={CalendarDaysIcon} title="Товлосон цаг алга" hint="Эмчтэй товлосон уулзалт одоогоор алга." compact />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col xl:overflow-y-auto">
          {upcoming.map((a) => <AppointmentLine key={a.id} a={a} />)}
        </div>
      )}
    </PlayCard>
  )
}

export default UpcomingAppointmentsList
