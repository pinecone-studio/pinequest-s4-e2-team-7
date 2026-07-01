'use client'

import { Fragment } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

const STEPS = [
  { n: 1, label: 'Асуумж' },
  { n: 2, label: 'Скрининг' },
  { n: 3, label: 'Дүгнэлт' },
]

// Асуумж → Скрининг → Дүгнэлт — read-only progress indicator.
export const ScreeningStepper = ({ current }: { current: number }) => (
  <div className="flex items-center">
    {STEPS.map((s, i) => {
      const done = s.n < current
      const active = s.n === current
      return (
        <Fragment key={s.n}>
          <div className="flex shrink-0 items-center gap-2.5">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
              done ? 'bg-primary text-text-on-primary' : active ? 'bg-primary text-text-on-primary shadow-(--shadow-glow-gold)' : 'bg-surface-raised text-text-muted'
            }`}>
              {done ? <CheckIcon className="size-4" /> : s.n}
            </span>
            <span className={`text-[13px] font-semibold ${active || done ? 'text-text-base' : 'text-text-muted'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`mx-3 h-px flex-1 ${done ? 'bg-primary' : 'bg-border'}`} />}
        </Fragment>
      )
    })}
  </div>
)
