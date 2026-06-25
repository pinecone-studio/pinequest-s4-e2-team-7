'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { getSpecialist, SPECIALISTS } from '@/lib/doctors'
import { getLastScanResult } from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'
import { PaperClipIcon } from '@heroicons/react/24/outline'

type Msg = { from: 'user' | 'doctor'; text: string; time: string; image?: string }

const greetingFor = (name: string) =>
  `Сайн байна уу! Би ${name}. Шалгалтын асуулт байвал асуугаарай.`

const DoctorChatContent = () => {
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctor')
  const doctor = getSpecialist(doctorId) ?? SPECIALISTS[0]

  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ from: 'doctor', text: greetingFor(doctor.name), time: '09:00' }])
  }, [doctor.id, doctor.name])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [...m, { from: 'user', text, time }])
    setInput('')
    setWaiting(true)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: 'doctor',
          text: `${doctor.name.split(' ').pop()} — баярлалаа. Ойрын хугацаанд клиникт үзүүлэхийг зөвлөж байна (демо).`,
          time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setWaiting(false)
    }, 1200)
  }

  const attachScan = () => {
    const scan = getLastScanResult()
    if (!scan) {
      alert('Шалгалтын үр дүн байхгүй')
      return
    }
    const time = new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [
      ...m,
      { from: 'user', text: 'Шалгалтын үр дүн илгээлээ', time, image: scan.imageUrl },
    ])
    setWaiting(true)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: 'doctor', text: 'Зургийг харлаа. Кариесийн шинж байна — үзлэгт ирээрэй.', time: '09:02' },
      ])
      setWaiting(false)
    }, 1500)
  }

  return (
    <AppShell
      title="Эмчийн зөвлөгөө"
      subtitle={`${doctor.name} · ${doctor.clinic}`}
      backHref={ROUTES.doctor.root}
    >
      <div className="warm-card mx-auto flex h-[min(640px,calc(100vh-220px))] max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-subtle text-lg font-bold text-primary">
            {doctor.name.charAt(0)}
          </span>
          <div>
            <p className="font-semibold text-text-base">{doctor.name}</p>
            <p className="text-[12px] text-text-muted">
              {doctor.clinic} · {waiting ? '● Хариу бичиж байна…' : '● Онлайн'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="Шалгалтын зураг" className="mb-2 max-h-40 rounded-2xl border border-border" />
              ) : null}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] ${
                  m.from === 'user' ? 'bg-[#F3B900] text-slate-900' : 'bg-surface-raised text-text-base'
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 text-[10px] text-text-muted">{m.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t border-border p-4">
          <button type="button" onClick={attachScan} className="warm-btn-secondary flex size-11 items-center justify-center rounded-full" aria-label="Шалгалт илгээх">
            <PaperClipIcon className="size-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Мессеж…"
            className="consumer-input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <Button onClick={send} disabled={waiting}>Илгээх</Button>
        </div>
      </div>
    </AppShell>
  )
}

const DoctorChatPage = () => (
  <Suspense fallback={<div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>}>
    <DoctorChatContent />
  </Suspense>
)

export default DoctorChatPage
