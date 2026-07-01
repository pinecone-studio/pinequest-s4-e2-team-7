'use client'

import { useState } from 'react'
import type { TriageLevel } from '@pinequest/types'
import type { SeasonSnapshot } from '@/hooks/useBoard'
import { formatSeason } from '@/lib/season'
import { TRIAGE_LABEL, TRIAGE_SHORT, TRIAGE_DOT } from '@/lib/triage'

// Same SVG technique as the dashboard ScreeningPlot: non-scaling stroke for the
// line, HTML-overlay dots so circles stay round under the stretched viewBox.
const W = 600, H = 168, PAD_X = 18, PAD_TOP = 16, PAD_BOT = 18, SVG_PX = 188
const F = SVG_PX / H
const MAX = 8

// Severity climbs upward: red at the top (a danger spike), green at the bottom.
const SEVERITY: Record<TriageLevel, number> = { green: 0, yellow: 1, red: 2 }
const STROKE: Record<TriageLevel, string> = { red: 'var(--color-triage-red)', yellow: 'var(--color-triage-yellow)', green: 'var(--color-triage-green)' }
const ROWS: { sev: number; level: TriageLevel }[] = [{ sev: 2, level: 'red' }, { sev: 1, level: 'yellow' }, { sev: 0, level: 'green' }]

const smoothPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 2) return ''
  const d = [`M ${pts[0].x},${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d.push(`C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`)
  }
  return d.join(' ')
}

// Triage status across the child's seasons — x: seasons (oldest→newest), y: status.
const SeasonTrendChart = ({ history }: { history: SeasonSnapshot[] }) => {
  const [hover, setHover] = useState<number | null>(null)
  const seasons = [...history]
    .sort((a, b) => new Date(a.screenedAt).getTime() - new Date(b.screenedAt).getTime())
    .slice(-MAX)
  const n = seasons.length
  if (n < 2) return <p className="py-12 text-center text-sm text-text-muted">Дор хаяж 2 улирлын мэдээлэл шаардлагатай.</p>

  const xAt = (i: number) => PAD_X + (i / Math.max(n - 1, 1)) * (W - PAD_X * 2)
  const yAt = (sev: number) => PAD_TOP + (1 - sev / 2) * (H - PAD_TOP - PAD_BOT)
  const pts = seasons.map((s, i) => ({ x: xAt(i), y: yAt(SEVERITY[s.effectiveLevel]) }))
  const line = smoothPath(pts)
  const active = hover !== null ? seasons[hover] : null
  const activePt = hover !== null ? pts[hover] : null

  return (
    <div className="flex py-2">
      <div className="relative w-16 shrink-0" style={{ height: SVG_PX }}>
        {ROWS.map((r) => (
          <span key={r.sev} style={{ top: yAt(r.sev) * F }} className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-text-muted">{TRIAGE_SHORT[r.level]}</span>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="relative" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: SVG_PX }} preserveAspectRatio="none">
            {ROWS.map((r) => (
              <line key={r.sev} x1={PAD_X} x2={W - PAD_X} y1={yAt(r.sev)} y2={yAt(r.sev)} stroke={STROKE[r.level]} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 5" />
            ))}
            <path d={line} fill="none" stroke="var(--color-text-muted)" strokeOpacity="0.55" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute inset-0 flex">
            {seasons.map((s, i) => <div key={s.seasonId} className="flex-1 cursor-pointer" onMouseEnter={() => setHover(i)} />)}
          </div>
          {pts.map((p, i) => (
            <span key={seasons[i].seasonId} style={{ left: `${(p.x / W) * 100}%`, top: p.y * F }}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_var(--color-surface)] transition-all duration-150 ${TRIAGE_DOT[seasons[i].effectiveLevel]} ${hover === i ? 'size-3.5' : 'size-2.5'}`} />
          ))}
          {active && activePt && (
            <div style={{ left: `${(activePt.x / W) * 100}%`, top: activePt.y * F - 10 }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-center shadow-(--shadow-card-lg)">
              <div className="text-[11px] font-semibold text-text-base">{formatSeason(active.seasonId)}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-text-muted">
                <span className={`size-1.5 rounded-full ${TRIAGE_DOT[active.effectiveLevel]}`} />{TRIAGE_LABEL[active.effectiveLevel]}
              </div>
            </div>
          )}
        </div>
        <div className="mt-1.5 flex">
          {seasons.map((s, i) => (
            <span key={s.seasonId} className={`flex-1 text-center text-[9px] leading-tight transition-colors ${hover === i ? 'font-bold text-text-base' : 'font-medium text-text-muted'}`}>{formatSeason(s.seasonId)}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SeasonTrendChart
