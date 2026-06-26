'use client'

import { useEffect, useMemo, useState } from 'react'
import { DentalClinicsMap } from '@/components/consumer/DentalClinicsMap'
import { ClinicListCard } from '@/components/consumer/MobilePatterns'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import {
  clinicDistanceKm,
  DENTAL_CLINICS_UB,
  directionsUrl,
  type DentalClinic,
} from '@/lib/dentalClinics'

type SortMode = 'near' | 'rating'

type DoctorMapPanelProps = {
  initialQuery?: string
  initialClinicId?: string | null
}

export const DoctorMapPanel = ({ initialQuery = '', initialClinicId = null }: DoctorMapPanelProps) => {
  const [selected, setSelected] = useState<DentalClinic | null>(() => {
    if (initialClinicId) {
      return DENTAL_CLINICS_UB.find((c) => c.id === initialClinicId) ?? DENTAL_CLINICS_UB[0] ?? null
    }
    return DENTAL_CLINICS_UB[0] ?? null
  })
  const [query, setQuery] = useState(initialQuery)
  const [sort, setSort] = useState<SortMode>('near')

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (initialClinicId) {
      const clinic = DENTAL_CLINICS_UB.find((c) => c.id === initialClinicId)
      if (clinic) setSelected(clinic)
    }
  }, [initialClinicId])

  const clinics = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = DENTAL_CLINICS_UB.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.addr.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q),
    )

    list = [...list].sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
      return clinicDistanceKm(a) - clinicDistanceKm(b)
    })

    return list
  }, [query, sort])

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Эмнэлэг хайх…"
        className="consumer-input w-full rounded-2xl"
      />

      <div className="flex flex-wrap gap-2">
        <FilterPill label="Ойрхон" active={sort === 'near'} onClick={() => setSort('near')} />
        <FilterPill label="Үнэлгээ" active={sort === 'rating'} onClick={() => setSort('rating')} />
      </div>

      <DentalClinicsMap selectedId={selected?.id ?? null} onSelect={setSelected} />

      <div className="space-y-3 pb-4">
        <p className="px-1 text-[12px] font-medium text-text-muted">{clinics.length} эмнэлэг</p>
        {clinics.map((c) => (
          <ClinicListCard
            key={c.id}
            name={c.name}
            rating={c.rating ?? 4.5}
            distanceKm={clinicDistanceKm(c)}
            addr={c.addr}
            hours={c.hours}
            phone={c.phone}
            active={selected?.id === c.id}
            onSelect={() => setSelected(c)}
            onNavigate={() => window.open(directionsUrl(c), '_blank', 'noopener,noreferrer')}
          />
        ))}
      </div>
    </div>
  )
}
