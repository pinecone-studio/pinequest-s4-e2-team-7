'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggle, ready } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex size-10 items-center justify-center rounded-full bg-surface text-text-muted shadow-[var(--shadow-card)] ring-1 ring-border transition-all duration-200 hover:text-text-base',
        className,
      )}
      aria-label={theme === 'dark' ? 'Гэрэл горим' : 'Харанхуй горим'}
      title={theme === 'dark' ? 'Гэрэл горим' : 'Харанхуй горим'}
    >
      {!ready ? <span className="size-4" /> : theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}
