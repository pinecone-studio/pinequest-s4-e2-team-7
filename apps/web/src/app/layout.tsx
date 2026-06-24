import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'PineQuest — Шүдний зөвөлгөө',
  description: 'Шүдний эрүүл мэндийн зөвөлгөө, чиглүүлэл авах платформ',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  )
}
