type Props = {
  pct: number
  size?: number
  stroke?: number
  track?: string   // CSS color for the unfilled track
  bar?: string     // CSS color (or gradient via url) for the filled arc
  children?: React.ReactNode
}

// Animated donut gauge — coverage / completion at a glance. The arc fills via
// an animated stroke-dashoffset (transition lives inline, respects motion prefs
// through the parent). Center slot holds the headline number.
const ProgressRing = ({ pct, size = 92, stroke = 9, track = 'var(--color-surface-raised)', bar = 'var(--color-primary)', children }: Props) => {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = c - (clamped / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export default ProgressRing
