import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Playful squircle tone-card — the deal-card language from the reference, on
// OUR palette: honey-gold / lime-accent / warm-dark / clean surface. Large
// radius, colored glow + lift on hover, spring pop-in on mount.
export type CardTone = 'gold' | 'lime' | 'dark' | 'surface'

const TONE: Record<CardTone, string> = {
  gold:    'bg-primary text-text-on-primary',
  lime:    'bg-accent text-accent-fg',
  dark:    'bg-brand-sidebar text-[#F4F0E4]',
  surface: 'bg-surface text-text-base border border-border',
}
const GLOW: Record<CardTone, string> = {
  gold:    'hover:shadow-(--shadow-glow-gold)',
  lime:    'hover:shadow-(--shadow-glow-lime)',
  dark:    'hover:shadow-(--shadow-glow-dark)',
  surface: 'hover:shadow-(--shadow-card-lg)',
}

type Props = {
  children: ReactNode
  tone?: CardTone
  className?: string
  pad?: boolean
  grow?: boolean       // hover lift + glow (clickable / featured cards)
  delay?: number       // stagger index for the pop-in entrance
}

const PlayCard = ({ children, tone = 'surface', className, pad = true, grow = true, delay = 0 }: Props) => (
  <div
    style={delay ? { animationDelay: `${delay * 60}ms` } : undefined}
    className={cn(
      'blob pop-in relative shadow-(--shadow-card)',
      TONE[tone],
      pad && 'p-5',
      grow && `grow ${GLOW[tone]}`,
      className,
    )}
  >
    {children}
  </div>
)

export default PlayCard
