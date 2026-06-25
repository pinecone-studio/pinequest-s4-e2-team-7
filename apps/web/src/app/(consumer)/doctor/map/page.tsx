'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const MapRedirectContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('view', 'map')
    const q = searchParams.get('q')
    const clinic = searchParams.get('clinic')
    if (q) params.set('q', q)
    if (clinic) params.set('clinic', clinic)
    router.replace(`/doctor?${params.toString()}`)
  }, [router, searchParams])

  return <div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>
}

export default function DoctorMapRedirect() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>}>
      <MapRedirectContent />
    </Suspense>
  )
}
