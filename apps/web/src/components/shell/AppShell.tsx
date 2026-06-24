import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen bg-bg">
    <Sidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
)

export default AppShell
