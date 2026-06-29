'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'

// Inline light/dark icon toggle — sits beside the season calendar (top-right).
// Chrome + height mirror the shared Dropdown trigger so they line up.
const ThemeToggle = () => {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('toothlings.theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Өдрийн горим' : 'Шөнийн горим'}
      className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary"
    >
      {dark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  )
}

export default ThemeToggle
