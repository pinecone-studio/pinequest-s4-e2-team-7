'use client'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

// Tunables
const VIDEO_RADIUS = 16 // matches the rounded-2xl card/media standard
const PLAY_D = 80 // big play button nested into the video's bottom-left corner
const MOAT = 16 // page-bg gap carved around the play button
const PLAY_INSET = 40 // play-button centre, px from the video's bottom-left corner
const CTRL_D = 50 // transport buttons, bottom-right
const HOLE_R = PLAY_D / 2 + MOAT // radius of the scoop carved into the video

const STAIRS: CSSProperties = {
  background: '#000',
  WebkitBoxDecorationBreak: 'clone',
  boxDecorationBreak: 'clone',
  padding: '0.1em 0.32em',
  borderRadius: '0.14em',
}

// Radial cut-out: a circular hole in the video around the play button, so the
// video's own shape scoops concavely around it (not just a blobby button).
const SCOOP = `radial-gradient(circle ${HOLE_R}px at ${PLAY_INSET}px calc(100% - ${PLAY_INSET}px), transparent ${HOLE_R}px, #000 ${HOLE_R}px)`

export const VideoSection = () => {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  const togglePlay = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }
  const toggleMute = () => {
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  const seek = (d: number) => {
    const v = ref.current
    if (!v) return
    v.currentTime = Math.max(0, v.currentTime + d)
  }

  return (
    <section id="intro-video" className="relative bg-black px-6 py-24 md:py-32" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="relative mx-auto mb-12 w-full max-w-260">
        <div
          className="overflow-hidden bg-black shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
          style={{ borderRadius: VIDEO_RADIUS, WebkitMaskImage: SCOOP, maskImage: SCOOP }}
        >
          <video
            ref={ref}
            className="aspect-video w-full cursor-pointer object-cover"
            src="/heroVideo.mp4#t=0.5"
            playsInline
            loop
            preload="metadata"
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <h2 className="pointer-events-none absolute left-5 top-5 max-w-[82%] font-black uppercase text-white sm:left-8 sm:top-8"
            style={{ fontSize: 'clamp(1.05rem, 2.6vw, 2.3rem)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            <span style={STAIRS}>Шүд цоорох өвчин ба<br />түүний хүндрэл</span>
          </h2>
        </div>

        {/* Big play/pause button nested into the carved bottom-left corner. */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Түр зогсоох' : 'Тоглуулах'}
          className="absolute grid place-items-center rounded-full bg-(--olive) text-[#0d1e35] shadow-(--shadow-card) transition duration-200 hover:scale-[1.05] hover:brightness-105"
          style={{ left: PLAY_INSET - PLAY_D / 2, bottom: PLAY_INSET - PLAY_D / 2, width: PLAY_D, height: PLAY_D }}
        >
          {playing ? <IconPause big /> : <IconPlay big />}
        </button>

        {/* Transport controls, bottom-right, icon-only. */}
        <div className="absolute bottom-5 right-5 flex items-center gap-3">
          <CtrlButton onClick={() => seek(-10)} ariaLabel="10 секунд буцах"><IconBack /></CtrlButton>
          <CtrlButton onClick={() => seek(10)} ariaLabel="10 секунд урагш"><IconForward /></CtrlButton>
          <CtrlButton onClick={toggleMute} ariaLabel={muted ? 'Дуу нээх' : 'Дуу хаах'}>{muted ? <IconMuted /> : <IconSound />}</CtrlButton>
        </div>
      </div>
    </section>
  )
}

const CtrlButton = ({ onClick, ariaLabel, children }: { onClick: () => void; ariaLabel: string; children: ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="grid place-items-center rounded-full text-white backdrop-blur-md transition duration-200 hover:brightness-125"
    style={{ width: CTRL_D, height: CTRL_D, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)' }}
  >
    {children}
  </button>
)

const IconPlay = ({ big }: { big?: boolean }) => (
  <svg width={big ? 30 : 18} height={big ? 30 : 18} viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
)
const IconPause = ({ big }: { big?: boolean }) => (
  <svg width={big ? 30 : 18} height={big ? 30 : 18} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zm6 0h4v14h-4z" /></svg>
)
const IconBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11 19L2 12l9-7zM22 19l-9-7 9-7z" /></svg>
)
const IconForward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5l9 7-9 7zM2 5l9 7-9 7z" /></svg>
)
const IconSound = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)
const IconMuted = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" />
  </svg>
)
