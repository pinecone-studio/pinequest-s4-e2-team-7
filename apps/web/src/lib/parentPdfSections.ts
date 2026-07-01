import type { TriageLevel } from '@pinequest/types'
import { childSummaryNarrative, guidanceLines, isBulletedText } from '@pinequest/core'
import type { ChildSummaryPayload, DentistNote, HospitalGuide } from '@/hooks/useChildSummary'
import { formatDateMn } from '@/lib/dateMn'

// Print-window HTML builders — mirror the summary modal card 1:1 (StudentSummaryBody):
// header → photos → questionnaire → advice → guidance → (dentist note) → hospital → contact.
// The print window has none of the app's CSS, so every colour is inlined. Badge wording
// matches the board's canonical TRIAGE_LABEL exactly.
const LEVEL_MN: Record<string, string> = { red: 'Яаралтай эмчилгээ шаардлагатай', yellow: 'Эмчилгээ шаардлагатай', green: 'Харьцангуй эрүүл' }
const STAGE_MN: Record<string, string> = { primary: 'сүүн шүдний нас', mixed: 'холимог шүдний нас', permanent: 'байнгын шүдний нас' }
const LEVEL_COLOR: Record<string, { bg: string; fg: string; border: string }> = {
  red: { bg: '#FBF1F0', fg: '#A84545', border: '#A8454530' },
  yellow: { bg: '#FEF3E7', fg: '#A8580A', border: '#A8580A30' },
  green: { bg: '#EEF9F3', fg: '#3B8C5E', border: '#3B8C5E30' },
}
const colFor = (l: string) => LEVEL_COLOR[l] ?? { bg: '#F5F5F4', fg: '#78716C', border: '#78716C30' }

export const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)

const label = (t: string) =>
  `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6B7280;margin-bottom:8px;">${t}</div>`

const card = (inner: string, extra = '') =>
  `<div style="background:#F5F5F4;border-radius:14px;padding:14px;margin-bottom:14px;${extra}">${inner}</div>`

export const headerHtml = (name: string, date: string, level: TriageLevel): string => {
  const col = colFor(level)
  return `<div style="text-align:center;margin-bottom:20px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF;margin-bottom:4px;">Toothlings — Шүдний скрининг</div>
    <div style="font-size:20px;font-weight:800;color:#111827;">${esc(name)}</div>
    <div style="font-size:12px;color:#6B7280;margin-top:2px;">${esc(date)}</div>
    <div style="display:inline-block;margin-top:10px;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;background:${col.bg};color:${col.fg};border:1px solid ${col.border};">${LEVEL_MN[level] ?? level}</div>
  </div>`
}

export const photosHtml = (dataUrls: string[]): string => {
  if (!dataUrls.length)
    return card(`<div style="text-align:center;color:#9CA3AF;font-size:13px;">Синк хийгдсэн зураг байхгүй</div>`)
  const imgs = dataUrls
    .map((src) => `<img src="${src}" alt="Зураг" style="width:100%;border-radius:10px;margin:5px 0;" />`)
    .join('')
  return `<div style="margin-bottom:14px;">${imgs}</div>`
}

export const questionnaireHtml = (detail: ChildSummaryPayload): string => {
  const rows = detail.questionnaireRaw ?? []
  if (!rows.length) return card(`${label('Асуумжаар')}<div style="font-size:12px;color:#6B7280;">Асуумж байхгүй</div>`)
  const body = rows
    .map(({ q, a }) => {
      const yes = a.trim() === 'Тийм'
      const no = a.trim() === 'Үгүй'
      const mark = no ? { s: '✓', c: '#3B8C5E' } : yes ? { s: '✕', c: '#A84545' } : { s: '?', c: '#9CA3AF' }
      return `<div style="display:flex;justify-content:space-between;gap:12px;margin:7px 0;font-size:12px;color:#111827;">
        <span><span style="color:${mark.c};font-weight:700;margin-right:6px;">${mark.s}</span>${esc(q)}</span>
        <span style="font-weight:600;white-space:nowrap;">${esc(a)}</span>
      </div>`
    })
    .join('')
  return card(`${label('Асуумжаар')}${body}`)
}

export const adviceHtml = (detail: ChildSummaryPayload, name: string): string => {
  const s = detail.summary
  const col = colFor(s?.effectiveLevel ?? 'yellow')
  const advice = (detail.advice ?? '').trim()
  let lines: string[]
  if (advice) {
    lines = advice.split(/(?<=[.!?])\s+/).map((l) => l.trim()).filter(Boolean)
  } else if (s) {
    lines = [`${name}, ${childSummaryNarrative(s)}`, s.headline]
  } else {
    return ''
  }
  const meta = s
    ? `<div style="font-size:12px;color:#6B7280;margin-top:8px;">${s.ageYears} нас · ${STAGE_MN[s.dentitionStage] ?? ''} · ${s.flaggedAreas} хэсэг тэмдэглэгдсэн</div>`
    : ''
  const body = lines
    .map((l) => `<div style="font-size:12px;line-height:1.5;color:#374151;margin-bottom:5px;">${esc(l)}</div>`)
    .join('')
  const steps =
    !detail.guidance && s?.homeSteps.length
      ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6B7280;margin:12px 0 6px;">Гэрийн нөхцөлд авах арга хэмжээ</div><ul style="padding-left:18px;margin:0;">${s.homeSteps.map((st) => `<li style="font-size:12px;color:#374151;margin:4px 0;">${esc(st)}</li>`).join('')}</ul>`
      : ''
  return card(
    `${label(`${esc(name)}-д тохирсон зөвлөгөө`)}${body}${meta}${steps}`,
    `background:${col.bg};border:1px solid ${col.border};`,
  )
}

const GUIDANCE_SECTIONS: { key: keyof NonNullable<ChildSummaryPayload['guidance']>; label: string }[] = [
  { key: 'homeCare', label: 'Гэртээ хэвшүүлэх амны хөндийн арчилгааны арга хэмжээ' },
  { key: 'brushing', label: 'Шүд угаах зөв арга, хугацаа' },
  { key: 'diet', label: 'Шүдийг эрүүлээр хадгалахад нөлөөлөх хоол, хүнс' },
  { key: 'prevention', label: 'Шүд цоорох өвчнөөс урьдчилан сэргийлэх' },
  { key: 'nextStep', label: 'Дараагийн алхам' },
]

export const guidanceHtml = (detail: ChildSummaryPayload): string => {
  const g = detail.guidance
  if (!g) return ''
  return GUIDANCE_SECTIONS.filter((sec) => g[sec.key]?.trim())
    .map((sec) => {
      const text = g[sec.key] ?? ''
      const body = isBulletedText(text)
        ? `<ul style="padding-left:18px;margin:6px 0 0;">${guidanceLines(text).map((l) => `<li style="font-size:12px;line-height:1.5;color:#111827;margin:3px 0;">${esc(l)}</li>`).join('')}</ul>`
        : `<div style="font-size:12px;line-height:1.5;color:#111827;margin-top:6px;">${esc(text)}</div>`
      return card(`${label(sec.label)}${body}`, `border:1px solid #E5E7EB;`)
    })
    .join('')
}

export const dentistNoteHtml = (note: DentistNote): string => {
  const col = colFor(note.confirmedLevel)
  const meta = [note.reviewerName ? esc(note.reviewerName) : null, formatDateMn(note.reviewedAt)].filter(Boolean).join(' · ')
  const noteText = note.note?.trim()
    ? `<div style="font-size:13px;line-height:1.5;color:#111827;margin-top:8px;">${esc(note.note.trim())}</div>`
    : `<div style="font-size:12px;color:#6B7280;margin-top:8px;font-style:italic;">Тэмдэглэл бичээгүй</div>`
  return card(
    `${label('Эмчийн тэмдэглэл')}
     <div style="display:inline-block;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:700;background:${col.bg};color:${col.fg};border:1px solid ${col.border};">Эмчийн баталгаажуулсан: ${LEVEL_MN[note.confirmedLevel] ?? note.confirmedLevel}</div>
     ${noteText}
     ${meta ? `<div style="font-size:11px;color:#9CA3AF;margin-top:8px;">Хянасан: ${meta}</div>` : ''}`,
    `border:1px solid ${col.border};`,
  )
}

export const hospitalHtml = (h: HospitalGuide): string =>
  card(
    `${label('Хамгийн ойр эмнэлэг')}
     <div style="font-weight:700;font-size:14px;color:#111827;">${esc(h.name)}</div>
     <div style="font-size:12px;color:#6B7280;margin-top:6px;">${esc(h.address)}</div>
     <div style="font-size:12px;color:#6B7280;">${h.travelMinutes} минутын зайд · ${h.distanceKm} км · ${esc(h.schedule)}</div>
     <div style="font-size:13px;font-weight:700;color:#0284C7;margin-top:6px;">${esc(h.phone)}</div>`,
    `background:#EFF6FF;border:1px solid #BFDBFE;`,
  )

export const contactHtml = (phone: string | null, email: string | null): string => {
  if (!phone && !email) return ''
  const rows = [phone && `📞 ${esc(phone)}`, email && `✉ ${esc(email)}`].filter(Boolean).join('<br>')
  return card(`${label('Холбоо барих')}<div style="font-size:13px;color:#111827;line-height:1.7;">${rows}</div>`)
}

export const disclaimerHtml = (): string =>
  `<div style="margin-top:20px;padding-top:14px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;line-height:1.6;">
    АНХААР: Энэ бол урьдчилсан дүгнэлт бөгөөд <strong>ОНОШ БИШ</strong>.<br>
    Эцсийн дүгнэлтийг мэргэжлийн шүдний эмч баталгаажуулна.
  </div>`
