'use client'
import { Fragment } from 'react'
import { m } from 'framer-motion'
import { GraphPaper } from './GraphPaper'
import { FlowNode } from './FlowNode'
import { FlowArrow } from './FlowArrow'
import { STEPS } from './storyContent'

// Vertical connector between stacked steps; keeps the constant comet flow.
const DownArrow = ({ reduce, bow }: { reduce?: boolean; bow: number }) => (
  <svg viewBox="0 0 80 88" className="h-18 w-20 overflow-visible" aria-hidden>
    <FlowArrow from={{ x: 40, y: 6 }} to={{ x: 40, y: 82 }} bow={bow} reduce={reduce} pad={8} />
  </svg>
)

const Reveal = ({ isStatic, children }: { isStatic?: boolean; children: React.ReactNode }) =>
  isStatic ? (
    <>{children}</>
  ) : (
    <m.div
      className="will-change-transform"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </m.div>
  )

// Mobile reveals + reduced-motion static. Every step is readable without motion.
export const ScrollStoryStacked = ({ isStatic }: { isStatic?: boolean }) => (
  <div className="relative flex flex-col items-center px-6 py-20">
    <GraphPaper />
    <div className="relative z-10 flex flex-col items-center">
      {STEPS.map((step, i) => (
        <Fragment key={step.num}>
          <Reveal isStatic={isStatic}>
            <FlowNode step={step} index={i} reduce={isStatic} />
          </Reveal>
          {i < STEPS.length - 1 && <DownArrow reduce={isStatic} bow={i % 2 === 0 ? 26 : -26} />}
        </Fragment>
      ))}
    </div>
  </div>
)
