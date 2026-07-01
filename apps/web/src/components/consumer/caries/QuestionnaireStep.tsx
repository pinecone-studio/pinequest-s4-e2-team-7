'use client'

import type { ReactNode } from 'react'
import { PAIN_WHEN_LABEL, PAIN_SINCE_LABEL, type PainWhen, type PainSince } from '@/lib/consumerState'

// The 4 clinical questions asked before screening — same set as the mobile flow.
export type SymptomAnswers = {
  hasPainfulTooth?: 'yes' | 'no'
  painWhen?: PainWhen
  painSince?: PainSince
  feverSwelling?: 'yes' | 'no'
}

/** Complete once the branch that applies is fully answered (Q2/Q3 only when in pain). */
export const isSymptomAnswersComplete = (a: SymptomAnswers): boolean => {
  if (!a.hasPainfulTooth || !a.feverSwelling) return false
  return a.hasPainfulTooth === 'yes' ? Boolean(a.painWhen && a.painSince) : true
}

const YES_NO = [{ value: 'yes' as const, label: 'Тийм' }, { value: 'no' as const, label: 'Үгүй' }]
const PAIN_WHEN_OPTS = (Object.keys(PAIN_WHEN_LABEL) as PainWhen[]).map((v) => ({ value: v, label: PAIN_WHEN_LABEL[v] }))
const PAIN_SINCE_OPTS = (Object.keys(PAIN_SINCE_LABEL) as PainSince[]).map((v) => ({ value: v, label: PAIN_SINCE_LABEL[v] }))

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className={`btn rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
      active ? 'bg-primary text-text-on-primary shadow-(--shadow-glow-gold)' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-text-base'
    }`}>
    {label}
  </button>
)

const Question = ({ n, total, title, children }: { n: number; total: number; title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2.5">
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] font-bold tabular-nums text-primary">{n}/{total}</span>
      <p className="text-[14px] font-semibold text-text-base">{title}</p>
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
)

export const QuestionnaireStep = ({ answers, onChange }: { answers: SymptomAnswers; onChange: (a: SymptomAnswers) => void }) => {
  const set = (patch: Partial<SymptomAnswers>) => onChange({ ...answers, ...patch })
  const hasPain = answers.hasPainfulTooth === 'yes'
  const total = hasPain ? 4 : 2

  return (
    <div className="flex flex-col gap-6">
      <Question n={1} total={total} title="Өвддөг шүд байгаа юу?">
        {YES_NO.map((o) => (
          <Chip key={o.value} label={o.label} active={answers.hasPainfulTooth === o.value}
            onClick={() => set({ hasPainfulTooth: o.value, ...(o.value === 'no' && { painWhen: undefined, painSince: undefined }) })} />
        ))}
      </Question>

      {hasPain && (
        <>
          <Question n={2} total={total} title="Ямар үед өвддөг вэ?">
            {PAIN_WHEN_OPTS.map((o) => <Chip key={o.value} label={o.label} active={answers.painWhen === o.value} onClick={() => set({ painWhen: o.value })} />)}
          </Question>
          <Question n={3} total={total} title="Хэзээнээс өвдөж эхэлсэн бэ?">
            {PAIN_SINCE_OPTS.map((o) => <Chip key={o.value} label={o.label} active={answers.painSince === o.value} onClick={() => set({ painSince: o.value })} />)}
          </Question>
        </>
      )}

      <Question n={hasPain ? 4 : 2} total={total} title="Халуурах эсвэл нүүр хавдах шинж байсан уу?">
        {YES_NO.map((o) => <Chip key={o.value} label={o.label} active={answers.feverSwelling === o.value} onClick={() => set({ feverSwelling: o.value })} />)}
      </Question>
    </div>
  )
}
