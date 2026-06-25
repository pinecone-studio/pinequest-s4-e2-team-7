import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Screener — Админ самбар',
  description: 'Шүдний цоорол илрүүлэх скрининг — ростер ба хяналтын самбар',
}

const initThemeScript = `(function(){try{var t=localStorage.getItem('screener.theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(_){}})()`

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="mn" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
    </head>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
