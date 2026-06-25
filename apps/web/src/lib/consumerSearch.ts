import { DENTAL_CLINICS_UB } from '@/lib/dentalClinics'
import { HOME_FEATURES, ROUTES } from '@/lib/routes'

export type SearchResult = {
  id: string
  label: string
  hint?: string
  href: string
  category: 'Хуудас' | 'Эмнэлэг' | 'Үйлдэл'
}

const PAGE_ITEMS: SearchResult[] = [
  { id: 'home', label: 'Нүүр', hint: 'Үндсэн самбар', href: ROUTES.home, category: 'Хуудас' },
  { id: 'scan', label: 'Шалгалт', hint: 'Шүдний AI шинжилгээ', href: ROUTES.scan.camera, category: 'Хуудас' },
  { id: 'scan-q', label: 'Асуумж', hint: 'Шалгалтын өмнөх асуултууд', href: ROUTES.scan.questionnaire, category: 'Хуудас' },
  { id: 'scan-result', label: 'Шалгалтын үр дүн', hint: 'Сүүлийн оношлогоо', href: ROUTES.scan.result, category: 'Хуудас' },
  { id: 'doctor', label: 'Тусламж', hint: 'Эмч, чат, эмнэлэг', href: ROUTES.doctor.root, category: 'Хуудас' },
  { id: 'doctor-map', label: 'Ойр байрлах эмнэлэг', hint: 'Газрын зураг', href: ROUTES.doctor.map, category: 'Хуудас' },
  { id: 'doctor-chat', label: 'Эмчийн зөвлөгөө', hint: 'Чат', href: ROUTES.doctor.chat, category: 'Хуудас' },
  { id: 'brush', label: 'Угаалга', hint: 'Угаалгын заавар', href: ROUTES.brush.root, category: 'Хуудас' },
  { id: 'brush-monitor', label: 'Ухаалаг хяналт', hint: 'Угаалгын хяналт', href: ROUTES.brush.monitor, category: 'Хуудас' },
  { id: 'profile', label: 'Профайл', hint: 'Бүртгэл', href: ROUTES.profile.root, category: 'Хуудас' },
  { id: 'profile-history', label: 'Шалгалтын түүх', hint: 'Профайл', href: ROUTES.profile.history, category: 'Хуудас' },
  { id: 'profile-export', label: 'Тайлан татах', hint: 'PDF / JSON', href: ROUTES.profile.export, category: 'Үйлдэл' },
  { id: 'profile-settings', label: 'Тохиргоо', hint: 'Профайл', href: ROUTES.profile.settings, category: 'Хуудас' },
  ...HOME_FEATURES.map((f) => ({
    id: `feature-${f.id}`,
    label: f.label,
    hint: f.desc,
    href: f.href,
    category: 'Үйлдэл' as const,
  })),
]

const CLINIC_ITEMS: SearchResult[] = DENTAL_CLINICS_UB.map((c) => ({
  id: `clinic-${c.id}`,
  label: c.nameMn ?? c.name,
  hint: `${c.area} · ${c.addr}`,
  href: `${ROUTES.doctor.map}&clinic=${encodeURIComponent(c.id)}&q=${encodeURIComponent(c.name)}`,
  category: 'Эмнэлэг' as const,
}))

const INDEX: Array<SearchResult & { tokens: string }> = [...PAGE_ITEMS, ...CLINIC_ITEMS].map((item) => ({
  ...item,
  tokens: [item.label, item.hint ?? '', item.category].join(' ').toLowerCase(),
}))

/** Match pages, actions, and UB dental clinics for the header search. */
export const searchConsumer = (query: string, limit = 8): SearchResult[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return INDEX.filter(
    (item) =>
      item.tokens.includes(q) ||
      q.split(/\s+/).every((word) => item.tokens.includes(word)),
  )
    .slice(0, limit)
    .map(({ id, label, hint, href, category }) => ({ id, label, hint, href, category }))
}
