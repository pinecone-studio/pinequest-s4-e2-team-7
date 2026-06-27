'use client'

import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { SeasonProvider } from '@/components/shared/SeasonProvider'
import SeasonSelector from '@/components/shared/SeasonSelector'
import NotificationBell from '@/components/shared/NotificationBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { ShellHeaderProvider, useShellHeader } from './ShellHeaderContext'

const ShellHeader = () => {
  const { header } = useShellHeader()
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 py-4 pr-1">
      <div>
        {header.title && (
          <h1 className="text-[22px] font-bold tracking-tight text-text-base">{header.title}</h1>
        )}
        {header.subtitle && (
          <p className="text-[12px] text-text-muted">{header.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {header.actions}
        <SeasonSelector />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}

const AppShell = ({ children }: { children: ReactNode }) => (
  <ShellHeaderProvider>
    <SeasonProvider>
      <div className="flex h-screen gap-4 overflow-hidden bg-bg p-4">
        <aside className="relative z-10 flex shrink-0 flex-col rounded-3xl border border-border bg-surface shadow-(--shadow-card)">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ShellHeader />
          <main className="page-in-wrap min-w-0 flex-1 overflow-y-auto pb-4 pr-1">{children}</main>
        </div>
      </div>
    </SeasonProvider>
  </ShellHeaderProvider>
)

export default AppShell
