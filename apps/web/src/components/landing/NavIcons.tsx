// Section icons for the page-nav rail. Stroke-based, inherit currentColor.
import type { FC, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, ...props,
})

// Эхлэл — home
const Home: FC<IconProps> = (p) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /></svg>
)

// Багийн танилцуулга — team
const Team: FC<IconProps> = (p) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5" /><path d="M17 14a6 6 0 0 1 4 6" /></svg>
)

// Асуудал — problem (alert)
const Problem: FC<IconProps> = (p) => (
  <svg {...base(p)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><path d="M12 17.5h.01" /></svg>
)

// Шийдэл — solution (idea)
const Solution: FC<IconProps> = (p) => (
  <svg {...base(p)}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z" /></svg>
)

// Апп — mobile
const Mobile: FC<IconProps> = (p) => (
  <svg {...base(p)}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
)

export const NAV_ICONS = [Home, Team, Problem, Solution, Mobile]
