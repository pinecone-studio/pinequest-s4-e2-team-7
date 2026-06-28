'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import EnvelopeReveal from '@/components/EnvelopeReveal'

const HEADING = 'Мэдэгдэл'
const BODY =
  'Энэхүү апп нь хүүхдийн шүд цоорох өвчин ба түүний хүндрэлийн эцсийн оношийг гаргахгүй ба амны хөндийн байдлыг үнэлэн эмчилгээ шаардлагатай тохиолдолыг илрүүлж эмчилгээ авахад чиглүүлэх болно.'

// Scroll-driven overlay: scrolling reveals the letter; the scrim fades out so
// the dashboard shows full-screen, then it dismisses at the end of the track.
const WelcomeOverlay = ({ onDone }: { onDone: () => void }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: ref })
  const scrimOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v > 0.995) onDone()
  })

  return (
    <div ref={ref} className="fixed inset-0 z-[200] overflow-y-auto">
      {/* dashboard scrim — fades as you scroll, revealing the full screen */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ opacity: scrimOpacity }}
      />
      {/* tall track gives the scroll its travel; envelope stays pinned */}
      <div style={{ height: '220vh' }}>
        <div className="sticky top-0 flex h-dvh items-center justify-center">
          <EnvelopeReveal
            ambient={false}
            scrollProgress={scrollYProgress}
            heading={HEADING}
            body={BODY}
          />
        </div>
      </div>
    </div>
  )
}

// One-shot disclaimer shown over the dashboard right after login/register.
// useAuth sets the `toothlings.welcome` flag then redirects here; we detect it
// on the new route and play the envelope.
export const WelcomeDisclaimer = () => {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('toothlings.welcome') === '1') {
        sessionStorage.removeItem('toothlings.welcome')
        setShow(true)
      }
    } catch { /* ignore */ }
  }, [pathname])

  if (!show) return null
  return <WelcomeOverlay onDone={() => setShow(false)} />
}
