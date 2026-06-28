'use client'
import { useReducedMotion } from 'framer-motion'
import { ScrollStoryDesktop } from './ScrollStoryDesktop'
import { ScrollStoryStacked } from './ScrollStoryStacked'
import { ACCENT } from './storyContent'

// Scroll-pinned product-flow story. Desktop scrubs four beats while pinned;
// mobile stacks one-shot reveals; reduced motion renders everything static.
export const ScrollStory = () => {
  const reduce = useReducedMotion()

  return (
    <section
      id="story"
      className="relative bg-black"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-24 md:pt-36">
        <p
          className="mb-4 text-[12px] font-bold uppercase tracking-[0.35em]"
          style={{ color: ACCENT }}
        >
          Шийдэл
        </p>
        <h2
          className="font-black uppercase"
          style={{
            fontSize: 'clamp(2rem, 5vw, 6rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            maxWidth: '16ch',
          }}
        >
          Гар утсаар амны хөндийн байдлыг үнэлэн чиглүүлэх
        </h2>
      </div>

      {reduce ? (
        <ScrollStoryStacked isStatic />
      ) : (
        <>
          <div className="hidden md:block">
            <ScrollStoryDesktop />
          </div>
          <div className="md:hidden">
            <ScrollStoryStacked />
          </div>
        </>
      )}

      
    </section>
  )
}
