'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/auth/RegisterForm'

const RegisterPage = () => {
  const router = useRouter()

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
      <Image src="/smilo.png" alt="Toothlings" width={132} height={60} priority className="h-auto w-33" />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">
          Скрининг хийгчээр бүртгүүлэх
        </h1>
        <p className="text-sm text-text-muted">
          Багш, сургууль/цэцэрлэгийн эмч зэрэг шүдний бус ажилтнуудад зориулсан.
        </p>
      </div>
      <RegisterForm onDone={() => router.push('/')} />
      <p className="text-sm text-text-muted">
        Бүртгэлтэй юу?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Нэвтрэх
        </Link>
      </p>
    </main>
  )
}

export default RegisterPage
