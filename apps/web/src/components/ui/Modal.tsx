'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import IconButton from './IconButton'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
  describedById?: string
}

const WIDTH: Record<NonNullable<Props['size']>, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md', describedById }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-describedby={describedById}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`dialog-in flex w-full ${WIDTH[size]} flex-col overflow-hidden blob border border-border bg-surface shadow-(--shadow-float) focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold tracking-tight text-text-base">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12px] text-text-muted">{subtitle}</p>}
          </div>
          <IconButton Icon={XMarkIcon} tone="plain" size="sm" label="Хаах" onClick={onClose} className="-mr-1" />
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-raised px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
