import { useState } from 'react'
import { Video } from '@/lib/icons'
import { ScheduleAppointmentModal } from '@/components/consumer/ScheduleAppointmentModal'

/** Улаан (яаралтай) үед — шүдний эмчтэй видео дуудлагын цаг товлох карт. */
export const ScheduleCallCard = () => {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Video className="size-5" strokeWidth={2} />
        </span>
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
          Шүдний эмчтэй видео дуудлага хийж зөвөлгөө авах
        </p>
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className="btn shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover active:scale-[0.98]"
        >
          Цаг товлох
        </button>
      </div>
      <ScheduleAppointmentModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </>
  )
}
