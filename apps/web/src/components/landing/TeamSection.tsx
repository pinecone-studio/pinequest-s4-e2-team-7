'use client'

import {
  AnimatePresence,
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from 'framer-motion'
import { useEffect, useState } from 'react'
import { getLenis } from './LenisProvider'

export type Member = {
  id: string
  name: string
  role: string
  contribution: string
  photo: string
  link?: { label: string; href: string }
}

// One shared ease-out curve drives all four motion layers so it reads as a single move.
const EASE = [0.22, 1, 0.36, 1] as const

const MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Норовсүрэн',
    role: 'Frontend / Motion',
    photo: '/images/team1.JPG',
    contribution:
      'Буух хуудас болон гүйлгээ удирдсан hero хэсгийг бүтээсэн. Хөдөлгөөний систем болон нийтлэг ease муруйг хариуцдаг.',
    link: { label: 'Ажлыг нь үзэх', href: '#' },
  },
  {
    id: 'm2',
    name: 'Ганхөлөг',
    role: 'Mobile / Capture',
    photo: '/images/team2.JPG',
    contribution:
      'Expo дээр офлайн-нэн тэргүүн зураг авах урсгалыг бичиж, төхөөрөмж дээрх inference-г үр дүнгийн дэлгэцтэй холбосон.',
    link: { label: 'Ажлыг нь үзэх', href: '#' },
  },
  {
    id: 'm3',
    name: 'Ариунзул',
    role: 'Backend / Sync',
    photo: '/images/team3.JPG',
    contribution:
      'Өөрчлөгдөшгүй event log болон нэг чиглэлийн sync үйлчилгээг зохион бүтээсэн. Fastify ingest, aggregation цэгүүдийг хийсэн.',
    link: { label: 'Ажлыг нь үзэх', href: '#' },
  },
  {
    id: 'm4',
    name: 'Мөнхжин',
    role: 'ML / Inference',
    photo: '/images/team4.JPG',
    contribution:
      'YOLOv8 цоорхой илрүүлэгчийг сургаж, ONNX хувилбарыг багцалсан. Inference гэрээ болон triage логикийг хариуцдаг.',
    link: { label: 'Ажлыг нь үзэх', href: '#' },
  },
  {
    id: 'm5',
    name: 'Чингүүн',
    role: 'Design / Content',
    photo: '/images/team5.png',
    contribution:
      '«Скрининг — онош биш» өнгө аяс болон эмчийн баталсан контентыг бүрдүүлсэн. Board worklist, follow-up мөчлөгийг зохион бүтээсэн.',
    link: { label: 'Ажлыг нь үзэх', href: '#' },
  },
]

const Preview = ({ member, reduce }: { member: Member; reduce: boolean }) => (
  <div className="relative mx-auto aspect-[4/5] max-h-[60vh] w-full overflow-hidden rounded-2xl bg-white/5">
    <AnimatePresence>
      {/* Layer 3 — photo crossfade keyed by member, a touch slower so it "catches up". */}
      <m.img
        key={member.id}
        src={member.photo}
        alt={member.name}
        className="absolute inset-0 h-full w-full object-cover object-top"
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      />
    </AnimatePresence>
  </div>
)

const TeamRow = ({
  member,
  index,
  active,
  setActive,
  reduce,
}: {
  member: Member
  index: number
  active: boolean
  setActive: (i: number) => void
  reduce: boolean
}) => {
  const container: Variants = {
    show: { transition: { delayChildren: reduce ? 0 : 0.12, staggerChildren: reduce ? 0 : 0.08 } },
  }
  // Layer 4 — text fades up first, pill lags by one stagger step (~80ms).
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.4, ease: EASE } },
  }
  return (
    <li className="border-b border-white/10">
      {/* Layer 1 — colour + weight tween between grey and white. */}
      <m.button
        type="button"
        aria-expanded={active}
        onFocus={() => setActive(index)}
        onClick={() => setActive(index)}
        className="block w-full py-2 text-left leading-[0.95] tracking-[-0.02em] outline-none focus-visible:underline"
        style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.8rem)' }}
        animate={{
          color: active ? '#ffffff' : 'rgba(255,255,255,0.22)',
          fontWeight: active ? 600 : 500,
        }}
        transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
      >
        {member.name}
      </m.button>
      {/* Layer 2 — accordion: the closing row collapses on the SAME transition the new one opens; siblings reflow in flow. */}
      <AnimatePresence initial={false}>
        {active && (
          <m.div
            className="overflow-hidden"
            initial={reduce ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
          >
            <m.div variants={container} initial="hidden" animate="show" className="max-w-xl pb-6">
              <m.p
                variants={item}
                className="mb-1 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--olive)' }}
              >
                {member.role}
              </m.p>
              <m.p variants={item} className="text-sm leading-relaxed text-white/60">
                {member.contribution}
              </m.p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  )
}

type TeamSectionProps = {
  members?: Member[]
  // Hero scroll progress (0–1). When supplied, scrolling steps through members one by one.
  progress?: MotionValue<number>
  // Sub-range of `progress` mapped across the members (after the clip-reveal finishes).
  range?: [number, number]
  // id of the scroll-driving section (the hero) so a name click can scroll to that member.
  scrollTargetId?: string
}

export const TeamSection = ({
  members = MEMBERS,
  progress,
  range = [0.36, 0.8],
  scrollTargetId,
}: TeamSectionProps) => {
  const [active, setActive] = useState(0)
  const reduce = !!useReducedMotion()
  const count = members.length

  // useMotionValueEvent needs a MotionValue even when no progress is supplied (hover/click-only mode).
  const fallback = useMotionValue(0)
  const indexFromProgress = (v: number) => {
    const [start, end] = range
    const t = (v - start) / (end - start)
    return Math.max(0, Math.min(count - 1, Math.floor(t * count)))
  }
  useMotionValueEvent(progress ?? fallback, 'change', (v) => {
    if (progress) setActive(indexFromProgress(v))
  })
  // Sync once on mount in case the panel is revealed mid-scroll.
  useEffect(() => {
    if (progress) setActive(indexFromProgress(progress.get()))
  }, [])

  // Scroll is the source of truth, so a click must move the scroll to that member —
  // otherwise the next scroll frame would immediately override a plain setState.
  const select = (i: number) => {
    setActive(i)
    const lenis = getLenis()
    const el = scrollTargetId ? document.getElementById(scrollTargetId) : null
    if (!progress || !lenis || !el) return
    const [start, end] = range
    const pI = start + ((i + 0.5) / count) * (end - start)
    const top = window.scrollY + el.getBoundingClientRect().top
    lenis.scrollTo(top + pI * (el.offsetHeight - window.innerHeight))
  }

  return (
    <section
      id="team"
      className="flex h-full min-h-dvh w-full items-center bg-[#0a0a0a] text-white"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-[minmax(0,460px)_1fr] md:gap-20">
        <div className="md:self-center">
          <h2
            className="mb-5 font-black uppercase"
            style={{ fontSize: 'clamp(1.3rem, 2.4vw, 2rem)', letterSpacing: '-0.02em', color: 'var(--olive)' }}
          >
            Багийн танилцуулга
          </h2>
          <Preview member={members[active]} reduce={reduce} />
        </div>
        <ul className="flex flex-col md:self-center">
          {members.map((mem, i) => (
            <TeamRow
              key={mem.id}
              member={mem}
              index={i}
              active={i === active}
              setActive={select}
              reduce={reduce}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
