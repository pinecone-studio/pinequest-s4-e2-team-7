'use client'
import { useState, useEffect } from 'react'
import { useReducedMotion } from 'framer-motion'
import { HeroText } from './HeroText'
import { HeroOpening } from './HeroOpening'

export const Hero = () => {
  const reduce = useReducedMotion()
  const [showOpening, setShowOpening] = useState(true)

  useEffect(() => {
    if (reduce || sessionStorage.getItem('screener_opened')) {
      setShowOpening(false)
      return
    }
    sessionStorage.setItem('screener_opened', '1')
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setShowOpening(false), 2100)
    const t2 = setTimeout(() => { document.body.style.overflow = '' }, 2800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [reduce])

  return (
    <section id="hero" className="relative h-dvh overflow-hidden bg-black">
      <div className="relative z-10 h-full">
        <HeroText />
      </div>
      <HeroOpening show={showOpening} />
    </section>
  )
}
