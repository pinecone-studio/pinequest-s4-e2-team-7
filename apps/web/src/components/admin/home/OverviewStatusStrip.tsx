'use client'

import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/solid'
import type { ComponentType, SVGProps } from 'react'
import type { TriageLevel } from '@pinequest/types'
import { useStats } from '@/hooks/useStats'
import { useSeason } from '@/components/shared/SeasonProvider'
import PlayCard from '@/components/ui/PlayCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { TRIAGE_LABEL, TRIAGE_SOFT, TRIAGE_TEXT, TRIAGE_ICON } from '@/lib/triage'

// The single at-a-glance status row: total screened + the full triage breakdown.
// Deliberately four numbers, nothing more — the overview.
type Cell = {
  key: string
  label: string
  value: number
  tint: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const triageCell = (level: TriageLevel, value: number): Cell => ({
  key: level,
  label: TRIAGE_LABEL[level],
  value,
  tint: `${TRIAGE_SOFT[level]} ${TRIAGE_TEXT[level]}`,
  Icon: TRIAGE_ICON[level],
})

const CellBody = ({ c }: { c: Cell }) => (
  <div className="py-0.5">
    <div className="flex items-center gap-2.5">
      <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${c.tint}`}>
        <c.Icon className="size-5" />
      </span>
      <span className="stat-rise text-[28px] font-black leading-none tabular-nums text-text-base">{c.value}</span>
    </div>
    <p className="mt-2 text-[11px] font-semibold leading-tight text-text-muted">{c.label}</p>
  </div>
)

const OverviewStatusStrip = () => {
  const { seasonId } = useSeason()
  const { data, isLoading } = useStats({ seasonId })
  if (isLoading) return <SkeletonCard rows={1} />

  const t = data?.triage ?? { green: 0, yellow: 0, red: 0 }
  const cells: Cell[] = [
    { key: 'total', label: 'Нийт үзлэг', value: data?.totalScreened ?? 0, tint: 'bg-primary-subtle text-primary', Icon: MagnifyingGlassCircleIcon },
    triageCell('red', t.red),
    triageCell('yellow', t.yellow),
    triageCell('green', t.green),
  ]

  return (
    <PlayCard tone="surface" delay={0} grow={false} className="shrink-0">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0">
        {cells.map((c, i) => (
          <div key={c.key} className={i === 0 ? '' : 'sm:border-l sm:border-border-muted sm:pl-5'}>
            <CellBody c={c} />
          </div>
        ))}
      </div>
    </PlayCard>
  )
}

export default OverviewStatusStrip
