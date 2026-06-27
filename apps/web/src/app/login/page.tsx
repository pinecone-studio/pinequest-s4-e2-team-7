'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const router = useRouter()

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <Image src="/smilo.png" alt="Toothlings" width={140} height={64} priority className="mb-3 h-auto w-35" />
        <p className="mt-1 text-sm text-text-muted">Скрининг удирдлагын самбар</p>
      </div>
      <div className="flex flex-col gap-3">
        <input defaultValue="admin@screener.mn" className="rounded-lg border border-border bg-surface px-3 py-2 text-text-base" />
        <input type="password" defaultValue="admin123" className="rounded-lg border border-border bg-surface px-3 py-2 text-text-base" />
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin')}
          className="rounded-lg bg-primary px-3 py-2 font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
        >
          Нэвтрэх
        </button>
      </div>
      <p className="text-sm text-text-muted">
        Шинэ скрининг хийгч үү?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Бүртгүүлэх
        </Link>
      </p>
    </main>
  )
}

export default LoginPage
