'use client'
import { m } from 'framer-motion'
import { ACCENT, type FlowStep } from './storyContent'

// A flow node: numbered pill that gently floats forever (constant motion),
// unless reduced motion is preferred.
export const FlowNode = ({ step, index, reduce }: { step: FlowStep; index: number; reduce?: boolean }) => (
  <m.div
    className="flex w-[clamp(230px,20vw,310px)] items-center gap-4 rounded-2xl px-6 py-5 will-change-transform"
    style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 22px 60px rgba(0,0,0,0.5)' }}
    animate={reduce ? undefined : { y: [0, -7, 0] }}
    transition={reduce ? undefined : { duration: 4.5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
  >
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-black"
      style={{ background: ACCENT, color: '#1a1205', fontSize: 'clamp(14px,1.2vw,17px)' }}
    >
      {step.num}
    </span>
    <span className="flex flex-col">
      <span className="font-bold leading-tight text-white" style={{ fontSize: 'clamp(15px,1.35vw,20px)' }}>
        {step.title}
      </span>
      <span className="mt-1 leading-snug" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(12px,1vw,14px)' }}>
        {step.sub}
      </span>
    </span>
  </m.div>
)
