'use client'
import { m } from 'framer-motion'
import { ACCENT } from './storyContent'

type Pt = { x: number; y: number }

// Curved arrow between two points, trimmed so it exits each node's bounding
// box (half-width hw / half-height hh) rather than by a fixed distance — so
// horizontal runs clear the wide pills and vertical runs stay long. `pad`
// overrides with a fixed trim (used by the small mobile connector).
const geom = (from: Pt, to: Pt, bow: number, hw: number, hh: number, pad?: number) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const ext = pad ?? Math.min(hw / Math.max(Math.abs(ux), 1e-3), hh / Math.max(Math.abs(uy), 1e-3)) + 18
  const a = { x: from.x + ux * ext, y: from.y + uy * ext }
  const b = { x: to.x - ux * ext, y: to.y - uy * ext }
  const cx = (a.x + b.x) / 2 + (-uy) * bow
  const cy = (a.y + b.y) / 2 + ux * bow
  const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
  const tx = b.x - cx
  const ty = b.y - cy
  const tl = Math.hypot(tx, ty) || 1
  const hx = tx / tl
  const hy = ty / tl
  const back = { x: b.x - hx * 36, y: b.y - hy * 36 }
  const w = 17
  const head = `M ${back.x - hy * w} ${back.y + hx * w} L ${b.x} ${b.y} L ${back.x + hy * w} ${back.y - hx * w}`
  return { d, head }
}

type Props = { from: Pt; to: Pt; bow: number; reduce?: boolean; pad?: number; hw?: number; hh?: number }

// Faint base path + a perpetually travelling "comet" (constant motion) + head.
export const FlowArrow = ({ from, to, bow, reduce, pad, hw = 200, hh = 92 }: Props) => {
  const { d, head } = geom(from, to, bow, hw, hh, pad)
  return (
    <g fill="none" stroke={ACCENT} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <path d={d} strokeWidth={2.6} opacity={0.32} />
      {!reduce && (
        <m.path
          d={d}
          strokeWidth={4.5}
          pathLength={0.18}
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <path d={head} strokeWidth={3.4} />
    </g>
  )
}
