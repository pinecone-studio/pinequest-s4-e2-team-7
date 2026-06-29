'use client'

import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'

const ScreeningPage = () => {
  useSetPageHeader({
    title: 'Амны хөндийн байдлын хяналт, үнэлгээ',
    subtitle: 'Оруулсан зургийг танин, дүгнэлт хийх болно.',
  })

  return <CariesDetectorDashboard />
}

export default ScreeningPage
