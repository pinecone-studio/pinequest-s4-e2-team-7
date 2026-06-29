'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import { BrushInstructions } from './BrushInstructions'
import { BrushMonitor } from './BrushMonitor'

type Tab = 'instructions' | 'monitor'

const TABS: { id: Tab; label: string }[] = [
  { id: 'instructions', label: 'Заавар' },
  { id: 'monitor',      label: 'Ухаалаг хяналт' },
]

const BrushPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'monitor' ? 'monitor' : 'instructions'

  useSetPageHeader({
    title: 'Ухаалаг сойз',
    subtitle: tab === 'instructions' ? 'Видео · 3D анимац · 45° өнцөг' : 'Хамралтын хяналт · бодит цаг',
  })

  const setTab = (next: Tab) =>
    router.replace(next === 'instructions' ? '/dashboard/brush' : '/dashboard/brush?tab=monitor', { scroll: false })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {TABS.map(({ id, label }) => (
          <FilterPill key={id} label={label} active={tab === id} onClick={() => setTab(id)} />
        ))}
      </div>

      {tab === 'instructions' ? <BrushInstructions /> : <BrushMonitor />}
    </div>
  )
}

const BrushPage = () => (
  <Suspense fallback={<div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>}>
    <BrushPageContent />
  </Suspense>
)

export default BrushPage
