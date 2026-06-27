'use client'

import Link from 'next/link'
import { ChevronRightIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import type { School } from '@pinequest/types'
import { useClasses } from '@/hooks/useClasses'
import { useSeason } from '@/components/shared/SeasonProvider'

const avatar = (s: School) =>
  (s.soumCode ?? s.name).replace(/[^A-ZА-ЯӨҮa-zа-яөү\d]/g, '').slice(0, 2).toUpperCase() || '??'

type Props = { school: School }

const SchoolSection = ({ school }: Props) => {
  const { seasonId } = useSeason()
  const { data: classes, isLoading } = useClasses(school.id)

  const seasonal = classes?.filter((c) => c.seasonId === seasonId) ?? []
  const pct = (c: { screened: number; enrolled: number }) =>
    c.enrolled > 0 ? Math.round((c.screened / c.enrolled) * 100) : 0

  return (
    <div className="blob border border-border bg-surface shadow-(--shadow-card)">
      {/* school header */}
      <Link href={`/dashboard/admin/schools/${school.id}`}
        className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-surface-raised">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-[13px] font-bold text-text-on-primary">
          {avatar(school)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-text-base">{school.name}</p>
          {school.district && <p className="text-[12px] text-text-muted">{school.district}</p>}
        </div>
        <ChevronRightIcon className="size-4 shrink-0 text-text-muted/40 transition-colors group-hover:text-text-muted" />
      </Link>

      {/* class rows */}
      <div className="border-t border-border">
        {isLoading && (
          <div className="px-5 py-3 text-[12px] text-text-muted">Уншиж байна…</div>
        )}
        {!isLoading && seasonal.length === 0 && (
          <div className="flex items-center gap-2 px-5 py-3 text-[12px] text-text-muted">
            <UserGroupIcon className="size-4 shrink-0 opacity-40" />
            Энэ улиралд анги бүртгэгдээгүй
          </div>
        )}
        {seasonal.map((c, i) => (
          <Link key={c.id} href={`/dashboard/admin/classes/${c.id}`}
            className={`group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-raised ${i > 0 ? 'border-t border-border-muted' : ''}`}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-[12px] font-bold text-text-muted transition-colors group-hover:bg-border">
              {c.name.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-text-base">{c.name}</p>
              <p className="text-[11px] text-text-muted">{c.seasonId}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct(c)}%` }} />
              </div>
              <span className="w-14 text-right text-[11px] text-text-muted tabular-nums">
                {c.screened}/{c.enrolled}
              </span>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-text-muted/30 transition-colors group-hover:text-text-muted" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SchoolSection
