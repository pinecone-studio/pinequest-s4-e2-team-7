'use client'
import { m } from 'framer-motion'
import { useState } from 'react'
import { AIMAGS, type Aimag } from './mongoliaAimags'

// Three-tier encoding by dental-clinic count:
// yellow = 5+ clinics, amber = 1-4 (limited — referral target), orange = none.
const HAS = '#F2B705'
const FEW = '#E89B2C'
const NONE = '#E2620E'
const tier = (c: number): 'has' | 'few' | 'none' => (c >= 5 ? 'has' : c > 0 ? 'few' : 'none')
const COLOR = { has: HAS, few: FEW, none: NONE }
const TINT = { has: 'rgba(242,183,5,0.18)', few: 'rgba(232,155,44,0.18)', none: 'rgba(226,98,14,0.18)' }
const BADGE = { has: 'Хангалттай', few: 'Хязгаарлагдмал', none: 'Эмнэлэггүй' }
const fmt = (n: number) => n.toLocaleString('en-US')

const Tooltip = ({ a }: { a: Aimag }) => {
  const t = tier(a.clinics)
  return (
    <div className="pointer-events-none w-60 rounded-xl border border-white/15 bg-[#0c0c0c]/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-bold text-white">{a.n}</span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: TINT[t], color: COLOR[t] }}>
          {BADGE[t]}
        </span>
      </div>
      <div className="mt-3 space-y-1.5 text-[12px]">
        <Row label="Шүдний эмнэлэг" value={`${a.clinics}`} />
        <Row label="Шүд цоорсон" value={`${a.p}%`} accent />
        <Row label="Цоорсон хүүхэд" value={`≈ ${fmt(a.affected)}`} />
        <Row label="Скрининг насны хүүхэд" value={`≈ ${fmt(a.kids)}`} />
      </div>
      {a.clinics > 0 && (
        <p className="mt-3 text-[11px]" style={{ color: COLOR[t] }}>
          Эмчилгээ шаардлагатай хүүхдийг энд чиглүүлнэ.
        </p>
      )}
    </div>
  )
}

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between gap-3">
    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
    <span className="font-bold" style={{ color: accent ? 'var(--olive)' : '#fff' }}>{value}</span>
  </div>
)

export const MongoliaMap = () => {
  const [hover, setHover] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const active = hover === null ? null : AIMAGS[hover]

  return (
    <figure className="mt-16 w-screen max-w-none" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      <div
        className="relative overflow-hidden bg-[#050505] py-10"
        onMouseMove={(e) => setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 90% at 50% 35%, rgba(226,98,14,0.14), transparent 70%)' }} />
        <svg viewBox="0 0 1000 480" className="relative mx-auto block w-full max-w-[1600px]" role="img" aria-label="Монгол улсын аймаг бүрийн шүдний эмчийн хүртээмж ба шүд цоорлын тархалт">
          <defs>
            <linearGradient id="relief" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="55%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <filter id="lift" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
            </filter>
          </defs>
          <g filter="url(#lift)">
            {AIMAGS.map((a, i) => (
              <m.path
                key={a.n}
                d={a.d}
                fill={COLOR[tier(a.clinics)]}
                stroke={hover === i ? '#fff' : 'rgba(0,0,0,0.45)'}
                strokeWidth={hover === i ? 1.6 : 0.8}
                style={{ cursor: 'pointer' }}
                animate={{ opacity: hover === null || hover === i ? 1 : 0.45 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onClick={() => setHover((h) => (h === i ? null : i))}
              />
            ))}
          </g>
          <g style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
            {AIMAGS.map((a) => (
              <path key={a.n} d={a.d} fill="url(#relief)" />
            ))}
          </g>
          {AIMAGS.map((a) => (
            <text key={a.n} x={a.cx} y={a.cy + 3} textAnchor="middle" fill="rgba(255,255,255,0.9)" style={{ fontSize: 9, fontWeight: 600, pointerEvents: 'none' }}>
              {a.n}
            </text>
          ))}
        </svg>
        {active && (
          <div className="absolute z-10" style={{ left: pos.x + 16, top: pos.y + 16 }}>
            <Tooltip a={active} />
          </div>
        )}
        <div className="mx-auto mt-6 flex max-w-[1600px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: HAS }} />5+ шүдний эмнэлэгтэй</span>
          <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: FEW }} />1–4 эмнэлэгтэй /багаж материал хомс, тогтмол үйл ажиллагаа явуулдаггүй/</span>
          <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: NONE }} />Шүдний эмнэлэггүй</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Аймаг бүр дарж дэлгэрэнгүй судалгаа харах</span>
        </div>
      </div>
    </figure>
  )
}
