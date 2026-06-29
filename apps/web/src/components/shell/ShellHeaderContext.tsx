'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type PageHeader = { title: string; subtitle?: string; actions?: ReactNode }
type Ctx = { header: PageHeader; setHeader: (h: PageHeader) => void }

const ShellHeaderCtx = createContext<Ctx | null>(null)

export const useShellHeader = () => {
  const ctx = useContext(ShellHeaderCtx)
  if (!ctx) throw new Error('useShellHeader must be within AppShell')
  return ctx
}

export const useSetPageHeader = ({ title, subtitle, actions }: PageHeader) => {
  const { setHeader } = useShellHeader()
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  // actions is read through a ref so changing it doesn't re-run this effect;
  // only title/subtitle should re-push the header.
  useEffect(() => {
    setHeader({ title, subtitle, actions: actionsRef.current })
    return () => setHeader({ title: '' })
  }, [title, subtitle])
}

export const ShellHeaderProvider = ({ children }: { children: ReactNode }) => {
  const [header, setHeader] = useState<PageHeader>({ title: '' })
  return <ShellHeaderCtx.Provider value={{ header, setHeader }}>{children}</ShellHeaderCtx.Provider>
}
