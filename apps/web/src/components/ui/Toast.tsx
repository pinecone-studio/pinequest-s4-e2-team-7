'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: string; type: ToastType; message: string }
type ToastCtx = { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }

const Ctx = createContext<ToastCtx | null>(null)

export const useToast = (): ToastCtx => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const ICON = { success: CheckCircleIcon, error: XCircleIcon, info: InformationCircleIcon }
const TONE = {
  success: 'border-triage-green/30 bg-triage-green-bg text-triage-green',
  error:   'border-triage-red/30 bg-triage-red-bg text-triage-red',
  info:    'border-border bg-surface text-text-base',
}

const Item = ({ t, dismiss }: { t: ToastItem; dismiss: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), 3500)
    return () => clearTimeout(timer)
  }, [t.id, dismiss])

  const Icon = ICON[t.type]
  return (
    <div className={`toast-in flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-(--shadow-float) ${TONE[t.type]}`} style={{ minWidth: 260, maxWidth: 340 }}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1 text-[13px] font-medium leading-snug">{t.message}</p>
      <button onClick={() => dismiss(t.id)} aria-label="Хаах" className="btn -mr-1 -mt-0.5 shrink-0 rounded-full p-1 opacity-60 hover:opacity-100">
        <XMarkIcon className="size-3.5" />
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const add = useCallback((type: ToastType, message: string) => {
    const id = `t${++counter.current}`
    setToasts((prev) => [...prev.slice(-4), { id, type, message }])
  }, [])

  const dismiss = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const ctx: ToastCtx = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg),
    info:    (msg) => add('info', msg),
  }

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => <Item key={t.id} t={t} dismiss={dismiss} />)}
      </div>
    </Ctx.Provider>
  )
}
