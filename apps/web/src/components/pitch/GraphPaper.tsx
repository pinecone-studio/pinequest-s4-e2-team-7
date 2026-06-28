'use client'

// Faint graph-paper grid via repeating-linear-gradient. Purely decorative.
export const GraphPaper = ({ className = '' }: { className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 64px),' +
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 64px)',
      maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 55%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 55%, transparent 100%)',
    }}
  />
)
