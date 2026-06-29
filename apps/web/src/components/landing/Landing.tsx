'use client'
import { LazyMotion, domAnimation } from 'framer-motion'
import { LenisProvider } from './LenisProvider'
import { Header } from './Header'
import { HeroWordmark } from './HeroWordmark'
import { Hero } from './hero/Hero'
import { TeamSection } from './TeamSection'
import { StatsSection } from './StatsSection'
import { VideoSection } from './VideoSection'
import { ScrollStory } from '../pitch/ScrollStory'
import { MobileSection } from './MobileSection'
import { PageNav } from './PageNav'
import { ScrollLine } from './ScrollLine'
import { Footer } from './Footer'
import { AuthOverlay } from './AuthOverlay'

export const Landing = () => (
  <>
    <style>{`
      :root {
        --olive: #F2B705;
      }
      .landing-wrap { background: #000; color: #fff; }
    `}</style>
    <LazyMotion features={domAnimation}>
      <LenisProvider>
        <div className="landing-wrap">
          <Header />
          <HeroWordmark />
          <Hero />
          <TeamSection />
          <StatsSection />
          <VideoSection />
          <ScrollStory />
          <MobileSection />
          <Footer />
          <PageNav />
          <ScrollLine />
          <AuthOverlay />
        </div>
      </LenisProvider>
    </LazyMotion>
  </>
)
