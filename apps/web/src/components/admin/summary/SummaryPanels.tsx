'use client'

import { useState } from 'react'
import {
  CameraIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon,
  XCircleIcon, MapPinIcon, ClockIcon, PhoneIcon, QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid'
import type { QuestionnaireAnswers, HospitalGuide } from '@/hooks/useChildSummary'

// Theme-aware triage tokens (NO hardcoded rose/amber/sky — those broke dark mode)
export const TRIAGE_BADGE: Record<string, string> = {
  red:    'bg-triage-red-bg text-triage-red border border-triage-red/20',
  yellow: 'bg-triage-yellow-bg text-triage-yellow border border-triage-yellow/20',
  green:  'bg-triage-green-bg text-triage-green border border-triage-green/20',
}
export const TRIAGE_BLOCK: Record<string, string> = {
  red: 'border-triage-red/20 bg-triage-red-bg', yellow: 'border-triage-yellow/20 bg-triage-yellow-bg', green: 'border-triage-green/20 bg-triage-green-bg',
}
export const TRIAGE_LABEL: Record<string, string> = {
  red: 'Яаралтай эмчилгээ шаардлагатай', yellow: 'Эмчилгээ шаардлагатай', green: 'Дараагийн хяналтанд хамруулах',
}

const SYMPTOMS: { key: keyof QuestionnaireAnswers; mn: string }[] = [
  { key: 'swelling',                    mn: 'Хавдар / хавдсан байдал' },
  { key: 'painDisturbingSleepOrEating', mn: 'Унтаж / идэж чадахгүй өвдөлт' },
  { key: 'fever',                        mn: 'Халуурах' },
  { key: 'gumPimpleOrFistula',           mn: 'Буйл дээр цэврүү эсвэл цоорхой' },
  { key: 'trauma',                       mn: 'Шүдэнд гэмтэл учирсан' },
  { key: 'bleedingGums',                 mn: 'Буйл цус алдах' },
]

const navBtn = 'btn absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-30'

export const ImageGallery = ({ refs }: { refs: string[] }) => {
  const [idx, setIdx] = useState(0)
  if (!refs.length) return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised text-text-muted/50">
      <CameraIcon className="size-7" /><span className="text-[11px]">Зураг байхгүй</span>
    </div>
  )
  const real = refs[idx]?.startsWith('http')
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-raised">
      {real
        ? <img src={refs[idx]} alt="" className="h-44 w-full object-cover" />
        : <div className="flex h-44 flex-col items-center justify-center gap-2">
            <CameraIcon className="size-9 text-text-muted/40" />
            <p className="text-[12px] font-medium text-text-muted">Үзүүлэлт зураг {idx + 1}/{refs.length}</p>
            <p className="text-[11px] text-text-muted/70">Утаснаас синк хийгдвэл харагдана</p>
          </div>}
      {refs.length > 1 && <>
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Өмнөх" className={`${navBtn} left-2`}><ChevronLeftIcon className="size-4" /></button>
        <button onClick={() => setIdx((i) => Math.min(refs.length - 1, i + 1))} disabled={idx === refs.length - 1} aria-label="Дараах" className={`${navBtn} right-2`}><ChevronRightIcon className="size-4" /></button>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {refs.map((_, i) => <button key={i} onClick={() => setIdx(i)} aria-label={`${i + 1}`} className={`size-1.5 rounded-full transition-all ${i === idx ? 'scale-125 bg-white' : 'bg-white/50'}`} />)}
        </div>
        <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white">{idx + 1}/{refs.length}</span>
      </>}
    </div>
  )
}

export const QuestionnairePanel = ({ q }: { q: QuestionnaireAnswers }) => (
  <div className="rounded-2xl bg-surface-raised px-4 py-3">
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Асуумжаар</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {SYMPTOMS.map(({ key, mn }) => {
        const val = q[key], yes = val === true, unk = val === null
        return (
          <div key={key} className="flex items-center gap-2">
            {unk ? <QuestionMarkCircleIcon className="size-4 shrink-0 text-text-muted/60" />
              : yes ? <XCircleIcon className="size-4 shrink-0 text-triage-red" />
              : <CheckCircleIcon className="size-4 shrink-0 text-triage-green" />}
            <span className="text-[12px] leading-tight text-text-base">{mn}</span>
          </div>
        )
      })}
    </div>
  </div>
)

export const HospitalGuidePanel = ({ h }: { h: HospitalGuide }) => (
  <div className="rounded-2xl border border-fu-contacted/20 bg-fu-contacted-bg p-4">
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-fu-contacted">Хамгийн ойр эмнэлэг</p>
    <p className="text-[14px] font-bold text-text-base">{h.name}</p>
    <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-text-muted">
      <div className="flex items-start gap-2"><MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-fu-contacted" />{h.address}</div>
      <div className="flex items-center gap-2"><ClockIcon className="size-3.5 shrink-0 text-fu-contacted" />{h.travelMinutes} минутын зайд · {h.distanceKm} км</div>
      <div className="flex items-center gap-2"><span className="font-medium text-text-base">Цагийн хуваарь:</span>{h.schedule}</div>
    </div>
    <a href={`tel:${h.phone}`} className="btn mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-fu-contacted py-2 text-[13px] font-semibold text-surface transition-all hover:brightness-95 active:scale-[0.98]">
      <PhoneIcon className="size-4" />{h.phone}
    </a>
  </div>
)
