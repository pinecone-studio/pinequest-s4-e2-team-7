import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

// Single warm-cream canvas: floating icon rail on the left, content on the
// right (no top nav bar — mockup style). The theme toggle now lives top-right
// beside the season calendar in the page header.
const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="flex h-screen gap-4 overflow-hidden bg-bg p-4">
    <aside className="relative z-10 flex shrink-0 flex-col rounded-3xl border border-border bg-surface shadow-(--shadow-card)">
      <Sidebar />
    </aside>

    <main className="page-in-wrap min-w-0 flex-1 overflow-y-auto py-4 pr-1">{children}</main>
  </div>
)

export default AppShell
