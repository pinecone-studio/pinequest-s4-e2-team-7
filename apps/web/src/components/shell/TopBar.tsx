'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowRightOnRectangleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useSession } from '@/components/providers'
import { useReviewQueue } from '@/hooks/useScreening'
import { useFollowUps } from '@/hooks/useFollowUps'
import { NAV_BY_ROLE } from './navConfig'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Админ',
  dentist: 'Эмч',
  follow_up: 'Дагах ажилтан',
  screener: 'Скринер',
}

const ROLE_INITIAL: Record<string, string> = {
  admin: 'А',
  dentist: 'Э',
  follow_up: 'Д',
  screener: 'С',
}

const TopBar = () => {
  const pathname = usePathname()
  const { role, logout } = useSession()
  const [dark, setDark] = useState(false)

  const { data: reviewQueue } = useReviewQueue()
  const { data: followUps } = useFollowUps()

  const reviewCount = reviewQueue?.filter(r => r.triageLevel === 'red').length ?? 0
  const followupCount = followUps?.filter(f => f.status === 'flagged').length ?? 0
  const badgeCounts: Record<string, number> = { review: reviewCount, followup: followupCount }

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleDark = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('screener.theme', next ? 'dark' : 'light')
    setDark(next)
  }

  const navItems = role ? (NAV_BY_ROLE[role] ?? []) : []

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-6 gap-6">
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="text-[15px] font-semibold text-text-base tracking-tight">Screener</span>
      </div>

      <nav className="flex flex-1 items-center justify-center gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const count = item.badgeKey ? (badgeCounts[item.badgeKey] ?? 0) : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                ${active ? 'bg-primary text-white' : 'text-text-muted hover:text-text-base'}`}
            >
              {item.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                  ${active ? 'bg-white/25 text-white' : 'bg-triage-red text-white'}`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={toggleDark}
          title={dark ? 'Өдрийн горим' : 'Шөнийн горим'}
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-base"
        >
          {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </button>

        <div className="flex items-center gap-2 pl-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary">
            {role ? (ROLE_INITIAL[role] ?? '?') : '?'}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-text-base">{role ? (ROLE_LABEL[role] ?? role) : ''}</span>
            <span className="text-[11px] text-text-muted">@{role ?? ''}</span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Гарах"
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-base"
        >
          <ArrowRightOnRectangleIcon className="size-4" />
        </button>
      </div>
    </header>
  )
}

export default TopBar
