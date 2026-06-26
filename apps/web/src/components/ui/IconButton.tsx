import type { ButtonHTMLAttributes, ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'

// Circular floating action button — the bell / expand / mail chips from the
// reference deal cards. `tone` blends it onto whatever surface it sits on.
type Tone = 'glass' | 'solid' | 'gold' | 'plain'

const TONE: Record<Tone, string> = {
  // translucent — for use on top of filled tone cards (gold/lime/dark)
  glass: 'bg-black/10 text-current hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20',
  // contrast chip — light circle on a dark card
  solid: 'bg-surface text-text-base hover:bg-surface-raised shadow-(--shadow-card)',
  // brand gold dot
  gold: 'bg-primary text-text-on-primary hover:bg-primary-hover shadow-(--shadow-card)',
  // bordered neutral — for plain white surfaces
  plain: 'bg-surface-raised text-text-muted hover:text-text-base',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  tone?: Tone
  size?: 'sm' | 'md'
  label: string
  spin?: boolean
}

const IconButton = ({ Icon, tone = 'plain', size = 'md', label, spin, className, ...rest }: Props) => (
  <button
    aria-label={label}
    title={label}
    className={cn(
      'tap flex shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
      size === 'sm' ? 'size-8' : 'size-9',
      TONE[tone],
      className,
    )}
    {...rest}
  >
    <Icon className={cn(size === 'sm' ? 'size-4' : 'size-[18px]', spin && 'icon-spin')} />
  </button>
)

export default IconButton
