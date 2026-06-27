'use client'

import { SeasonProvider } from '@/components/shared/SeasonProvider'
import AppShell from '@/components/shell/AppShell'

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>
    <SeasonProvider>{children}</SeasonProvider>
  </AppShell>
)

export default AdminLayout
