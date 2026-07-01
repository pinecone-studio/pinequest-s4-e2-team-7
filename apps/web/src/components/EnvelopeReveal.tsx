'use client'

import {
  motion, animate, useMotionValue, useTransform, useReducedMotion,
  type MotionValue,
} from 'framer-motion'
import { useEffect } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

// Letter travel (px): tucked in the pocket (0) → risen fully above the mouth.
const LETTER_HIDDEN = 0
const LETTER_REST = -205

// Subtle fibrous paper texture, clipped to each envelope piece.
const PAPER =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

const PaperTexture = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0"
    style={{ backgroundImage: PAPER, backgroundSize: '180px 180px', opacity: 0.05, mixBlendMode: 'multiply' }}
  />
)

type Props = {
  heading?: string
  body?: string
  /** Pastel gradient wash + airplane. Off when used as a bare overlay. */
  ambient?: boolean
  /** Drive the reveal from external scroll progress (0→1). When omitted, a
   *  one-time auto-play runs on mount instead. */
  scrollProgress?: MotionValue<number>
}

export default function EnvelopeReveal({
  heading = 'A note before you explore',
  body = "Good design doesn't announce itself. It just makes the thing feel inevitable. Take a slow look around — everything here was placed on purpose.",
  ambient = true,
  scrollProgress,
}: Props) {
  const reduce = useReducedMotion()
  const internal = useMotionValue(reduce ? 1 : 0)
  const progress = scrollProgress ?? internal

  useEffect(() => {
    if (scrollProgress || reduce) return
    const controls = animate(internal, 1, { duration: 1.6, ease: EASE })
    return () => controls.stop()
  }, [scrollProgress, reduce, internal])

  const letterY = useTransform(progress, [0.05, 0.72], [LETTER_HIDDEN, LETTER_REST])

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-6">
      {ambient && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(120deg, #fff6e3 0%, #fdeef0 32%, #eef2fc 66%, #fff6e3 100%)',
              backgroundSize: '200% 200%',
            }}
            animate={reduce ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.svg
            aria-hidden
            width="74" height="74" viewBox="0 0 24 24"
            className="pointer-events-none absolute right-[8%] top-[20%] text-slate-300/70"
            animate={reduce ? undefined : { y: [0, -12, 0], x: [0, 7, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path fill="currentColor" d="M2 12l19-9-7 19-3-7-9-3z" opacity="0.55" />
          </motion.svg>
        </>
      )}

     
    

      {/* ── Envelope ── */}
      <div className="relative" style={{ width: 'min(560px, 92vw)', aspectRatio: '22 / 25' }}>

        {/* Layer 0 — envelope body (back) */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: '34%', left: 0, right: 0, bottom: 0, zIndex: 1,
            background: 'linear-gradient(#f4efe4, #ece4d3)',
            borderRadius: '4px 4px 22px 22px',
            boxShadow: '0 44px 80px rgba(20,16,8,0.45)',
          }}
        >
          <PaperTexture />
        </div>

        {/* Layer 1 — open back flap (apex up) */}
        <div
          className="absolute"
          style={{
            top: 0, left: 0, right: 0, height: '42%', zIndex: 2,
            background: 'linear-gradient(#faf6ec, #efe8d8)',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          }}
        >
          <PaperTexture />
          {/* soft shading down the two folded edges */}
          <div className="absolute inset-0" style={{
            background:
              'linear-gradient(to bottom right, rgba(70,55,20,0.06), transparent 24%),' +
              'linear-gradient(to bottom left, rgba(70,55,20,0.06), transparent 24%)',
          }} />
        </div>

        {/* Layer 2 — letter / note card (rises out of the pocket) */}
        <motion.div
          className="absolute rounded-2xl"
          style={{
            y: letterY,
            left: '6%', right: '6%', top: '21%', zIndex: 3,
            background: '#fdfbf6',
            padding: '32px 38px 46px',
            boxShadow: '0 18px 44px rgba(20,16,8,0.22)',
          }}
        >
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 26, fontWeight: 500, color: '#1f1b16', lineHeight: 1.28,
          }}>
            {heading}
          </h2>
          <div style={{ width: 56, height: 1, margin: '18px 0', background: '#d9d3c6' }} />
          <p style={{ fontSize: 15.5, lineHeight: 1.85, color: '#57534c' }}>
            {body}
          </p>
        </motion.div>

        {/* Layer 3 — front pocket: rounded base + peak chevron (covers letter bottom) */}
        {/* base — straight top, rounded bottom corners (matches the reference) */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: '63%', left: 0, right: 0, bottom: 0, zIndex: 4,
            background: 'linear-gradient(#ece5d4, #e4dbc6)',
            borderRadius: '0 0 26px 26px',
          }}
        >
          <PaperTexture />
        </div>
        {/* peak chevron rising above the base */}
        <div
          className="absolute"
          style={{
            top: 0, left: 0, right: 0, bottom: 0, zIndex: 4,
            background: 'linear-gradient(#efe8d8, #eae1cd)',
            clipPath: 'polygon(0% 63%, 50% 45%, 100% 63%, 100% 67%, 0% 67%)',
          }}
        >
          <PaperTexture />
        </div>
        {/* side-flap creases from the peak down to the bottom corners */}
        <div
          className="absolute"
          style={{
            top: 0, left: 0, right: 0, bottom: 0, zIndex: 4,
            clipPath: 'polygon(0% 63%, 50% 45%, 100% 63%, 100% 100%, 0% 100%)',
            background:
              'linear-gradient(to top right, transparent calc(50% - 0.6px), rgba(110,88,40,0.14) 50%, transparent calc(50% + 0.6px)),' +
              'linear-gradient(to top left, transparent calc(50% - 0.6px), rgba(110,88,40,0.14) 50%, transparent calc(50% + 0.6px))',
          }}
        />
        {/* brand stamp on the envelope front */}
        <img
          src="/logoGreen.png"
          alt="ToothLings"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none"
          style={{ bottom: '11%', width: 60, opacity: 0.8, zIndex: 5 }}
        />

      </div>
    </div>
  )
}
