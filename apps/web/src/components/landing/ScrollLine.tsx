'use client'
import { useScroll, useSpring, useTransform, m } from 'framer-motion'

// Right-rail progress line: a thin vertical track with a dot that travels
// from top to bottom as the page scrolls.
const LINE = 320

export const ScrollLine = () => {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  const dotY = useTransform(progress, [0, 1], [0, LINE])

  return (
    <div className="pointer-events-none fixed right-8 top-1/2 z-50 -translate-y-1/2" style={{ height: LINE }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: 1, height: LINE, background: 'rgba(255,255,255,0.18)' }} />
      <m.div
        className="absolute left-1/2 flex items-center justify-center -translate-x-1/2"
        style={{ y: dotY, top: -11, width: 22, height: 22, borderRadius: 999, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.4)' }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--olive)' }} />
      </m.div>
    </div>
  )
}
