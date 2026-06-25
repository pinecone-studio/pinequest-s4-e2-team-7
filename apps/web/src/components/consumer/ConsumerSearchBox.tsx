'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from '@/lib/icons'
import { searchConsumer, type SearchResult } from '@/lib/consumerSearch'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

export const ConsumerSearchBox = () => {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => searchConsumer(query), [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const go = (item: SearchResult) => {
    setOpen(false)
    setQuery('')
    router.push(item.href)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results[activeIndex]) go(results[activeIndex])
    else if (query.trim()) {
      setOpen(false)
      router.push(`${ROUTES.doctor.map}&q=${encodeURIComponent(query.trim())}`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 max-w-xl">
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Хайх..."
          aria-label="Хайх"
          aria-expanded={showDropdown}
          aria-controls="consumer-search-results"
          autoComplete="off"
          className="consumer-input w-full py-2.5 pl-4 pr-11 text-[14px]"
        />
        <Search className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" strokeWidth={2} />
      </form>

      {showDropdown ? (
        <div
          id="consumer-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-float)]"
        >
          {results.length > 0 ? (
            <ul className="max-h-[320px] overflow-y-auto py-1">
              {results.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      i === activeIndex ? 'bg-[#F3B900]/12' : 'hover:bg-surface-raised',
                    )}
                  >
                    <span className="mt-0.5 shrink-0 rounded-full bg-consumer-chrome px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      {item.category}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-text-base">{item.label}</span>
                      {item.hint ? (
                        <span className="mt-0.5 block truncate text-[12px] text-text-muted">{item.hint}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-[13px] text-text-muted">
              Илэрц олдсонгүй —{' '}
              <Link
                href={`${ROUTES.doctor.map}&q=${encodeURIComponent(query.trim())}`}
                className="font-semibold text-[#B8860B] hover:underline"
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
              >
                эмнэлэг хайх
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
