import Link from 'next/link'
import { MapPin } from '@/lib/icons'
import { ROUTES } from '@/lib/routes'

/** Улаан/шар үед — хамгийн ойр шүдний эмнэлэг рүү чиглүүлэх карт. */
export const NearestClinicCard = () => (
  <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-muted">
      <MapPin className="size-5" strokeWidth={2} />
    </span>
    <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
      Санал болгох хамгийн ойр шүдний эмнэлэг
    </p>
    <Link
      href={ROUTES.doctor.map}
      className="btn shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-base transition hover:border-primary"
    >
      Харах
    </Link>
  </div>
)
