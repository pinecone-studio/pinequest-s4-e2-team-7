export type Clinic = {
  id: string
  name: string
  area: string
  lat: number
  lng: number
  hours: string
  addr: string
  phone?: string
  rating?: number
}

export const UB_CENTER = { lat: 47.9184, lng: 106.9177 }

export const CLINICS: Clinic[] = [
  { id: 'smile-dental', name: 'Smile Dental', area: 'БЗД', lat: 47.9128, lng: 106.9515, hours: '09:00–18:00', addr: 'Баянзүрх дүүрэг, 15-р хороо', phone: '77112233', rating: 4.8 },
  { id: 'kids-teeth', name: 'Kids Teeth UB', area: 'СБД', lat: 47.9175, lng: 106.9234, hours: '10:00–19:00', addr: 'Сүхбаатар дүүрэг, Олимпийн гудамж', phone: '77114455', rating: 4.9 },
  { id: 'family-dental', name: 'Family Dental', area: 'ХУД', lat: 47.8892, lng: 106.9078, hours: '08:30–17:30', addr: 'Хан-Уул дүүрэг, 3-р хороо', phone: '77116677', rating: 4.6 },
  { id: 'monnis-dental', name: 'Monnis Dental', area: 'СБД', lat: 47.9142, lng: 106.9156, hours: '09:00–20:00', addr: 'Чингисийн өргөн чөлөө, СБД', phone: '70101234', rating: 4.7 },
  { id: 'nomad-dental', name: 'Nomad Dental Clinic', area: 'БГД', lat: 47.9285, lng: 106.8856, hours: '09:00–18:00', addr: 'Баянгол дүүрэг, 4-р хороо', phone: '77118899', rating: 4.5 },
  { id: 'state-dental', name: 'Улсын шүдний эмнэлэг', area: 'СБД', lat: 47.9201, lng: 106.9189, hours: '08:30–17:00', addr: 'Бага тойруу 76, СБД', phone: '70111234', rating: 4.6 },
  { id: 'shine-med', name: 'Shine Med Dental', area: 'СХД', lat: 47.9312, lng: 106.8723, hours: '08:00–18:00', addr: 'Сонгинохайрхан дүүрэг, 21-р хороо', phone: '77113344', rating: 4.4 },
  { id: 'dental-life', name: 'Dental Life UB', area: 'ХУД', lat: 47.9012, lng: 106.9345, hours: '10:00–19:00', addr: 'Энхтайваны өргөн чөлөө, ХУД', phone: '77115566', rating: 4.3 },
]

export const distanceKm = (clinic: Clinic, userLat: number, userLng: number): number => {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(clinic.lat - userLat)
  const dLng = toRad(clinic.lng - userLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(clinic.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const directionsUrl = (clinic: Clinic): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
