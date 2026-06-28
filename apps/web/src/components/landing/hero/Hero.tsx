'use client'
import { useRef, useState, useEffect } from 'react'
import { m, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { HeroText } from './HeroText'
import { HeroTeamPanel } from './HeroTeam'
import { HeroOpening } from './HeroOpening'

export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [showOpening, setShowOpening] = useState(true)

  useEffect(() => {
    if (reduce || sessionStorage.getItem('screener_opened')) {
      setShowOpening(false)
      return
    }
    sessionStorage.setItem('screener_opened', '1')
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setShowOpening(false), 2100)
    const t2 = setTimeout(() => { document.body.style.overflow = '' }, 2800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [reduce])

  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const springP = useSpring(raw, { stiffness: 80, damping: 20 })
  const p = reduce ? raw : springP

  const heroOpacity = useTransform(p, (v) => {
    const start = 0.2
    const end = 0.3
    if (v <= start) return 1
    return Math.max(0, 1 - (v - start) / (end - start))
  })

  // Reveal the team panel early (by p≈0.35) so the remaining ~65% of the scroll is the
  // 5-member sequence — roughly one screen of scroll per member.
  const rawInset = useTransform(p, (v) => {
    if (v <= 0.25) return 100
    if (v >= 0.35) return 0
    return 100 - ((v - 0.25) / (0.35 - 0.25)) * 100
  })
  const panelClip = useTransform(rawInset, (v) => `inset(${Math.max(0, Math.min(100, v))}% 0 0 0)`)

  return (
    <section id="hero" ref={ref} className="relative h-[520dvh] bg-black md:h-[680vh]">
      <div className="sticky top-0 h-dvh overflow-hidden will-change-transform">
        <m.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 bg-black">
          <HeroText p={p} />
        </m.div>
        <m.div style={{ clipPath: panelClip }} className="absolute inset-0 z-20 hidden md:block">
          <HeroTeamPanel p={p} />
        </m.div>
        <HeroOpening show={showOpening} />
      </div>
      <div className="relative h-dvh md:hidden">
        <HeroTeamPanel p={p} />
      </div>
    </section>
  )
}
