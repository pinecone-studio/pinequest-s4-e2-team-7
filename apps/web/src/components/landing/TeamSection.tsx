'use client'

import {
  AnimatePresence,
  animate,
  m,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'

type Member = { name: string; role: string; image: string }

// NOTE (temporary): specialized roles collapsed to "Full-stack Developer" for now.
// Originals were Frontend/Motion, Mobile/Capture, Backend/Sync, ML/Inference, Design/Content.
const MEMBERS: Member[] = [
  { name: 'Норовсүрэн', role: 'Full-stack Developer', image: '/images/team1.JPG' },
  { name: 'Ганхөлөг', role: 'Full-stack Developer', image: '/images/team2.JPG' },
  { name: 'Ариунзул', role: 'Full-stack Developer', image: '/images/team3.JPG' },
  { name: 'Мөнхжин', role: 'Full-stack Developer', image: '/images/team4.JPG' },
  { name: 'Чингүүн', role: 'Full-stack Developer', image: '/images/team5.png' },
]

// --- THEME (named so a dark theme can be swapped back in trivially) ---
const SECTION_BG = '#0a0a0a' // near-black, consistent with the other landing sections
const GIANT_TEXT = 'rgba(255,255,255,0.06)' // faint giant backdrop word-mark on black
const GIANT_OLIVE = 'rgba(82, 160, 117,0.1)' // faint olive for the "Lings" half of the backdrop
const LABEL_TEXT = 'var(--olive)' // yellow accent for the small section label
const ACCENT = 'var(--olive)' // yellow accent (#52A075); focus rings + role label
const CARD_GRADIENT = 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%)'

const SPRING = { type: 'spring', stiffness: 220, damping: 26 } as const
const RING: CSSProperties = { '--tw-ring-color': ACCENT } as CSSProperties
const SPEED = 0.32 // members advanced per second => one full turn every ~16s

// Deterministic per-card scatter seeded by INDEX (no Math.random / Date.now -> no hydration drift).
const fract = (n: number) => n - Math.floor(n)
const scatter = (i: number) => {
  const k = (i + 1) * 12.9898
  return {
    rotate: (fract(Math.sin(k) * 43758.5453) * 2 - 1) * 6, // small in-plane scatter
    tiltX: (fract(Math.sin(k * 0.7) * 43758.5453) * 2 - 1) * 6, // 3D forward/back tilt
    dy: (fract(Math.sin(k * 1.7) * 43758.5453) * 2 - 1) * 22, // scattered vertical offset
    dur: 4 + fract(Math.sin(k * 2.3) * 43758.5453) * 3, // 4s..7s float
  }
}

const CardFace = ({ member }: { member: Member }) => (
  <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#171412]">
    <img src={member.image} alt={member.name} className="h-full w-full object-cover object-top" draggable={false} />
    <div className="absolute inset-0" style={{ background: CARD_GRADIENT }} />
    <p className="absolute inset-x-0 bottom-0 p-3 text-left font-black leading-none text-white/95" style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1.15rem)', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
      {member.name}
    </p>
  </div>
)

// One card on the continuous coverflow. Its position is derived live from `phase`
// (members scrolled past) via motion values, so it animates at 60fps with no re-render.
const CarouselCard = ({ member, index, count, phase, onPin }: { member: Member; index: number; count: number; phase: MotionValue<number>; onPin: () => void }) => {
  const s = scatter(index)
  // Signed distance of this card from the front of the carousel, continuous + wrapping.
  const dist = useTransform(phase, (p) => {
    const raw = (((index - p) % count) + count) % count
    return raw > count / 2 ? raw - count : raw
  })
  const x = useTransform(dist, (v) => v * 200)
  const z = useTransform(dist, (v) => -Math.abs(v) * 120)
  const rotateY = useTransform(dist, (v) => v * -20)
  const scale = useTransform(dist, (v) => Math.max(1.12 - Math.abs(v) * 0.16, 0.74))
  const opacity = useTransform(dist, (v) => Math.max(1 - Math.abs(v) * 0.16, 0.45))
  const filter = useTransform(dist, (v) => `brightness(${Math.max(0.45, 1 - Math.abs(v) * 0.18)})`)
  const zIndex = useTransform(dist, (v) => Math.round(100 - Math.abs(v) * 10))
  return (
    <m.button
      type="button"
      onClick={onPin}
      aria-label={member.name}
      className="absolute left-1/2 top-1/2 -ml-24 -mt-34 h-68 w-48 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 md:-ml-28 md:-mt-44 md:h-88 md:w-56"
      style={{ x, z, rotateY, scale, opacity, zIndex, y: s.dy, rotate: s.rotate, rotateX: s.tiltX, transformStyle: 'preserve-3d', ...RING }}
    >
      {/* Perpetual organic float layered on top of the carousel rotation. */}
      <m.div className="h-full w-full" style={{ filter }} animate={{ y: [0, -10, 0, 8, 0] }} transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}>
        <CardFace member={member} />
      </m.div>
    </m.button>
  )
}

export const TeamSection = ({ members = MEMBERS }: { members?: Member[] }) => {
  const reduce = !!useReducedMotion()
  const count = members.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  // The carousel feeds live motion values into `style`; framer serialises those differently
  // during SSR, so render it client-only (after mount) to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false)
  const phase = useMotionValue(0)

  // Continuously rotate the carousel; pause on hover or reduced motion.
  useAnimationFrame((_, delta) => {
    if (reduce || isPaused) return
    const next = phase.get() + (delta / 1000) * SPEED
    phase.set(((next % count) + count) % count)
  })
  // The front card (nearest phase) drives the role panel.
  useMotionValueEvent(phase, 'change', (p) => {
    const idx = ((Math.round(p) % count) + count) % count
    setActiveIndex((prev) => (prev === idx ? prev : idx))
  })
  useEffect(() => setMounted(true), [])

  // Click a card: spring it to the front (shortest way round) and pin.
  const pin = (index: number) => {
    setIsPaused(true)
    const cur = phase.get()
    let target = index
    while (target - cur > count / 2) target -= count
    while (target - cur < -count / 2) target += count
    animate(phase, target, { type: 'spring', stiffness: 120, damping: 20, onComplete: () => phase.set(((target % count) + count) % count) })
  }
  const active = members[activeIndex]

  return (
    <section id="team" className="relative flex min-h-dvh w-full flex-col overflow-hidden px-6 py-16 md:px-12" style={{ background: SECTION_BG }}>
      <h2 className="relative z-30 font-black uppercase tracking-[0.04em]" style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)', color: LABEL_TEXT }}>
        Багийн танилцуулга
      </h2>

      {/* GIANT brand word-mark, BEHIND all cards (lower z). */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <span className="block whitespace-nowrap text-center font-black" style={{ fontSize: 'clamp(3.5rem, 16vw, 18rem)', lineHeight: 0.82, letterSpacing: '-0.04em' }}>
          <span style={{ color: GIANT_TEXT }}>Tooth</span><span style={{ color: GIANT_OLIVE }}>Lings</span>
        </span>
      </div>

      {/* Card stage. */}
      {reduce || !mounted ? (
        <div className="relative z-10 flex flex-1 flex-wrap items-center justify-center gap-4">
          {members.map((member, i) => (
            <button key={member.name} type="button" onMouseEnter={() => setActiveIndex(i)} onFocus={() => setActiveIndex(i)} onClick={() => setActiveIndex(i)} aria-current={i === activeIndex} className="h-80 w-56 rounded-2xl outline-none focus-visible:ring-2" style={{ opacity: i === activeIndex ? 1 : 0.78, ...RING }}>
              <CardFace member={member} />
            </button>
          ))}
        </div>
      ) : (
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="relative h-104 w-full md:h-128" style={{ perspective: '1400px' }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {members.map((member, i) => (
              <CarouselCard key={member.name} member={member} index={i} count={count} phase={phase} onPin={() => pin(i)} />
            ))}
          </div>
        </div>
      )}

      {/* Active member's role (crossfades, reserved height = no layout shift). */}
      <div className="relative z-30 min-h-8 max-w-xl">
        <AnimatePresence>
          <m.div key={activeIndex} className="absolute inset-x-0" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }} transition={reduce ? { duration: 0.25 } : SPRING}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              {active.role}
            </p>
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
