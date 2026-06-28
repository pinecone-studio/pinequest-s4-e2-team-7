'use client'
import Link from 'next/link'
import { type MotionValue } from 'framer-motion'
import { AT, HERO_IMGS } from './heroData'
import { Zoom } from './Zoom'

export const HeroText = ({ p }: { p: MotionValue<number> }) => (
  <div className="flex h-full w-full items-center px-[3vw]">
    <div className="w-full">
      <h1
        style={{ fontSize: 'clamp(1.8rem, 5vw, 7.5rem)', lineHeight: 0.92, letterSpacing: '-0.03em' }}
        className="w-full select-none font-black uppercase"
      >
        <span className="block">
          <span style={{ color: 'var(--olive)' }}>Амны хөндийн байдлыг үнэлэн</span>
          <span className="text-white"> эмчилгээ шаардлагатай </span>
        </span>
        <span className="block text-white">
          <Zoom p={p} at={AT[0]} src={HERO_IMGS[0].src} round />{' '}
          тохиолдолд 
          <Zoom p={p} at={AT[1]} src={HERO_IMGS[1].src} round />
        </span>
        <span className="block text-white">
          <Zoom p={p} at={AT[2]} src={HERO_IMGS[2].src} />{' '}
         чиглүүлэн хянах
          <Zoom p={p} at={AT[3]} src={HERO_IMGS[3].src} round />{' '}
          платформ
        </span>
      </h1>

      
    </div>
  </div>
)
