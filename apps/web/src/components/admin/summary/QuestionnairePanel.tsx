'use client'

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import type { QuestionnaireAnswers } from '@/hooks/useChildSummary'

const ONSET_MN: Record<string, string> = {
  yesterday: 'Өчигдрөөс',
  '2_3_days': '2–3 хоног',
  '5_plus_days': '5-аас олон хоног',
}

const PAIN_Q: { key: keyof QuestionnaireAnswers; mn: string }[] = [
  { key: 'painCold', mn: 'Хүйтэнд' },
  { key: 'painHot', mn: 'Халуунд' },
  { key: 'painBiting', mn: 'Зажлахад' },
  { key: 'painSpontaneous', mn: 'Аяндаа' },
  { key: 'painNight', mn: 'Шөнө' },
]

const DANGER_Q: { key: keyof QuestionnaireAnswers; mn: string }[] = [
  { key: 'fever', mn: 'Халуурах' },
  { key: 'swelling', mn: 'Нүүр / буйл хавдсан' },
  { key: 'gumPimpleOrFistula', mn: 'Буйл дээр цэврүү' },
  { key: 'trauma', mn: 'Шүдэнд гэмтэл' },
]

const YesNo = ({ on }: { on: boolean }) => (
  <span className={`flex items-center gap-1 text-[12px] font-medium ${on ? 'text-triage-red' : 'text-triage-green'}`}>
    {on ? <XCircleIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
    {on ? 'Тийм' : 'Үгүй'}
  </span>
)

export const QuestionnairePanel = ({ q }: { q: QuestionnaireAnswers }) => (
  <section className="rounded-2xl bg-surface-raised px-4 py-3">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">1. Асуумж</p>

    <div className="flex items-center justify-between border-b border-border pb-2.5">
      <span className="text-[13px] font-medium text-text-base">Шүд нь өвддөг үү?</span>
      <YesNo on={q.painPresent} />
    </div>

    {q.painPresent ? (
      <div className="border-b border-border py-2.5">
        <p className="mb-2 text-[11px] text-text-muted">Ямар үед өвддөг вэ?</p>
        <div className="flex flex-wrap gap-1.5">
          {PAIN_Q.filter(({ key }) => q[key]).map(({ key, mn }) => (
            <span key={key} className="rounded-full bg-triage-red-bg px-2.5 py-1 text-[11px] font-medium text-triage-red">{mn}</span>
          ))}
          {!PAIN_Q.some(({ key }) => q[key]) && <span className="text-[12px] text-text-muted">Тодорхойлоогүй</span>}
        </div>
        {q.painOnset && (
          <p className="mt-2 text-[12px] text-text-muted">Хэзээнээс: <span className="font-medium text-text-base">{ONSET_MN[q.painOnset]}</span></p>
        )}
      </div>
    ) : (
      <p className="border-b border-border py-2.5 text-[12px] text-text-muted">Өвдөлтгүй — амны хөндийн зургаар шинжилгээг үргэлжлүүлэв.</p>
    )}

    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2.5">
      {DANGER_Q.map(({ key, mn }) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <span className="text-[12px] leading-tight text-text-base">{mn}</span>
          <YesNo on={q[key] === true} />
        </div>
      ))}
    </div>
  </section>
)
