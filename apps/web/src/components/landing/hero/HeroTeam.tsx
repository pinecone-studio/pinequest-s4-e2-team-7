'use client'
import { type MotionValue } from 'framer-motion'
import { TeamSection } from '../TeamSection'

// Phase 2 of the hero scroll: the team explorer, revealed by the clip in Hero and
// stepped through one member at a time by the same Lenis scroll progress.
export const HeroTeamPanel = ({ p }: { p: MotionValue<number> }) => (
  <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
    <TeamSection progress={p} scrollTargetId="hero" />
  </div>
)
