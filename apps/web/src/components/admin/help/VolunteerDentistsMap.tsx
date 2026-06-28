'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { SPECIALTY_LABEL } from './DentistProfileCard'

// Mongolia geographic center — covers rural soum areas across the whole country
const MONGOLIA_CENTER = { lat: 46.8625, lng: 103.8467 }
const MONGOLIA_ZOOM = 5

type Props = {
  dentists: VolunteerDentist[]
  selectedId?: string | null
  onSelect?: (dentist: VolunteerDentist) => void
  className?: string
}

export const VolunteerDentistsMap = ({ dentists, selectedId, onSelect, className }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const leafletRef = useRef<typeof import('leaflet') | null>(null)

  const pinHtml = (active: boolean, initials: string) =>
    `<div style="width:${active ? 38 : 32}px;height:${active ? 38 : 32}px;background:${active ? '#ef4444' : '#6b7280'};border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${active ? 13 : 11}px;font-weight:700;">${initials}</div>`

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    let cancelled = false

    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstance.current) return
      leafletRef.current = L

      const map = L.map(mapRef.current, {
        center: [MONGOLIA_CENTER.lat, MONGOLIA_CENTER.lng],
        zoom: MONGOLIA_ZOOM,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapInstance.current = map
    }).catch(() => {})

    return () => {
      cancelled = true
      mapInstance.current?.remove()
      mapInstance.current = null
      markersRef.current.clear()
    }
  }, [])

  // Sync markers whenever dentist list or selection changes
  useEffect(() => {
    const map = mapInstance.current
    const L = leafletRef.current
    if (!map || !L) return

    const pinned = new Set<string>()

    for (const d of dentists) {
      if (d.lat == null || d.lng == null) continue
      const active = d.id === selectedId
      const initials = d.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
      const icon = L.divIcon({ className: '', html: pinHtml(active, initials), iconSize: [active ? 38 : 32, active ? 38 : 32], iconAnchor: [active ? 19 : 16, active ? 19 : 16] })

      const existing = markersRef.current.get(d.id)
      if (existing) {
        existing.setIcon(icon)
        const popup = `<b>${d.displayName}</b>${d.specialty ? `<br/><span style="font-size:11px">${SPECIALTY_LABEL[d.specialty] ?? d.specialty}</span>` : ''}${d.area ? `<br/><span style="font-size:11px;color:#6b7280">${d.area}</span>` : ''}`
        existing.bindPopup(popup)
      } else {
        const popup = `<b>${d.displayName}</b>${d.specialty ? `<br/><span style="font-size:11px">${SPECIALTY_LABEL[d.specialty] ?? d.specialty}</span>` : ''}${d.area ? `<br/><span style="font-size:11px;color:#6b7280">${d.area}</span>` : ''}`
        const m = L.marker([d.lat, d.lng], { icon }).addTo(map).bindPopup(popup)
        if (onSelect) m.on('click', () => onSelect(d))
        markersRef.current.set(d.id, m)
      }
      pinned.add(d.id)
    }

    // Remove markers for dentists no longer in the list
    for (const [id, marker] of markersRef.current) {
      if (!pinned.has(id)) { marker.remove(); markersRef.current.delete(id) }
    }

    // Pan to selected marker
    if (selectedId) {
      const sel = dentists.find((d) => d.id === selectedId)
      if (sel?.lat != null && sel.lng != null) {
        map.setView([sel.lat, sel.lng], Math.max(map.getZoom(), 9), { animate: true })
      }
    }
  }, [dentists, selectedId, onSelect])

  const hasPins = dentists.some((d) => d.lat != null)

  return (
    <div className={className}>
      {!hasPins && (
        <div className="flex h-full items-center justify-center text-[12px] text-text-muted">
          Байршлын мэдээлэл байхгүй
        </div>
      )}
      <div ref={mapRef} className="h-full w-full rounded-xl" />
    </div>
  )
}
