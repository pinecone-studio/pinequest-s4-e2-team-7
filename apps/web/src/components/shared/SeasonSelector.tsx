'use client'

import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useSeason } from '@/components/shared/SeasonProvider'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'

const SEASON_MN: Record<string, string> = {
  spring: 'Хавар', summer: 'Зун', fall: 'Намар', autumn: 'Намар', winter: 'Өвөл',
}
// "2026-fall" → "2026 Намар"
const seasonLabel = (s: string): string => {
  const [year, term] = s.split('-')
  return term ? `${year} ${SEASON_MN[term] ?? term}` : s
}

// Board-wide season picker — uses the shared Dropdown so it matches every other
// dropdown in the admin section. Hidden until at least one season exists.
const SeasonSelector = () => {
  const { seasonId, setSeasonId, seasons } = useSeason()
  if (seasons.length === 0 || !seasonId) return null

  const options: DropdownOption[] = seasons.map((s) => ({ value: s, label: seasonLabel(s), Icon: CalendarDaysIcon }))

  return <Dropdown value={seasonId} options={options} onChange={setSeasonId} ariaLabel="Улирал сонгох" align="right" />
}

export default SeasonSelector
