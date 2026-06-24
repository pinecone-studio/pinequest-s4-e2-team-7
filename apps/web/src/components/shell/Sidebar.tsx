'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/components/providers'
import { NAV_BY_ROLE } from './navConfig'

const Sidebar = () => {
  const pathname = usePathname()
  const { role } = useSession()
  const navItems = role ? (NAV_BY_ROLE[role] ?? []) : []

  return (
    <aside className="flex w-18 shrink-0 flex-col items-center border-r border-border bg-sidebar-bg py-4 gap-1">
      <div className="mb-5 flex size-9 items-center justify-center rounded-xl bg-primary">
        <span className="text-base font-bold text-white">S</span>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex size-11 items-center justify-center rounded-full transition-colors
                ${active
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-surface-raised hover:text-text-base'
                }`}
            >
              <item.Icon className="size-5" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
