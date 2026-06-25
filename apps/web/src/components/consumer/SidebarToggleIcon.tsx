'use client'

import { ArrowLeft, Menu } from '@/lib/icons'
import { cn } from '@/lib/utils'

/** Hamburger ↔ left arrow — 180° Y-axis flip on toggle. */
export const SidebarToggleIcon = ({ collapsed }: { collapsed: boolean }) => (
  <span className="[perspective:500px]">
    <span
      className={cn(
        'relative block size-5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d]',
        collapsed && '[transform:rotateY(180deg)]',
      )}
      aria-hidden
    >
      {/* Front — left arrow (sidebar нээлттэй, хураах) */}
      <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
        <ArrowLeft className="size-5" strokeWidth={2} />
      </span>
      {/* Back — hamburger (sidebar хураагдсан, нээх) */}
      <span className="absolute inset-0 flex [transform:rotateY(180deg)] items-center justify-center [backface-visibility:hidden]">
        <Menu className="size-5" strokeWidth={2} />
      </span>
    </span>
  </span>
)
