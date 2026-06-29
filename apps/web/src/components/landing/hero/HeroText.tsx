'use client'
import type { CSSProperties } from 'react'

// "Stairs" backdrop: a black box cloned onto every wrapped line so each line
// gets its own rounded black plate hugging its width — the stepped silhouette
// from the Shape reference. The bg video shows through around it.
const STAIRS: CSSProperties = {
  background: '#000',
  WebkitBoxDecorationBreak: 'clone',
  boxDecorationBreak: 'clone',
  padding: '0.08em 0.34em',
  borderRadius: '0.16em',
}

export const HeroText = () => (
  <div className="flex h-full w-full items-center px-[3vw]">
    <div className="w-full">
      <h1
        style={{ fontSize: 'clamp(1.8rem, 5vw, 7rem)', lineHeight: 1.16, letterSpacing: '-0.03em' }}
        className="w-full select-none font-black uppercase"
      >
        <span style={STAIRS}>
          <span style={{ color: 'var(--olive)' }}>Амны хөндийн байдлыг үнэлэн</span>
          <br />
          <span className="text-white">эмчилгээ шаардлагатай тохиолдолд</span>
          <br />
          <span className="text-white">чиглүүлэн хянах платформ</span>
        </span>
      </h1>
    </div>
  </div>
)
