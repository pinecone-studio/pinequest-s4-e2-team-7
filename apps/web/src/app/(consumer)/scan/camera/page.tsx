'use client'

import Link from 'next/link'
import { CariesDetectorDashboard } from '@/components/consumer/CariesDetectorDashboard'
import { ROUTES } from '@/lib/routes'

const ScanCameraPage = () => (
  <div className="mx-auto max-w-[1400px]">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-[#F3B900]">AI шинжилгээ</p>
        <h2 className="mt-2 text-[32px] font-bold tracking-tight text-text-base">Шүдний шалгалт</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text-muted">
          Зураг оруулаад шууд ангилал, зөвлөмж, илрүүлсэн зүйлсийг хараарай.
        </p>
      </div>
      <Link
        href={ROUTES.scan.questionnaire}
        className="text-[13px] font-semibold text-text-muted underline-offset-2 hover:text-primary hover:underline"
      >
        Асуумж засах
      </Link>
    </div>
    <CariesDetectorDashboard />
  </div>
)

export default ScanCameraPage
