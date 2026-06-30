'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import { useParams } from 'next/navigation'
import { ReviewForm } from '@/components/dentist/ReviewForm'
import { TriageBadge } from '@/components/ui/TriageBadge'
import { AuthImage } from '@/components/ui/AuthImage'
import { useScreening } from '@/hooks/useScreening'
import { PageSpinner } from '@/components/ui/Spinner'

// Gemini-ийн нас тохирсон зөвлөмжийн талбарууд (consumer-тэй ижил гарчгууд).
const GUIDANCE_FIELDS = [
  { key: 'homeCare', label: 'Гэртээ' },
  { key: 'brushing', label: 'Шүд угаах' },
  { key: 'diet', label: 'Хоол хүнс' },
  { key: 'prevention', label: 'Урьдчилан сэргийлэх' },
  { key: 'nextStep', label: 'Дараагийн алхам' },
] as const

const ScreeningChartPage = () => {
  const id = useParams().id as string
  const { data: s } = useScreening(id)

  if (!s) return <PageSpinner />

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dashboard/dentist" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ChevronLeftIcon className="size-4" /> Жагсаалт
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Скрининг</h1>
        <span className="text-sm text-text-muted">AI:</span>
        <TriageBadge level={s.triageLevel} />
        {s.review ? (
          <>
            <span className="text-sm text-text-muted">Эмч:</span>
            <TriageBadge level={s.review.confirmedLevel} />
          </>
        ) : null}
      </div>

      <p className="text-sm text-text-muted">
        {new Date(s.capturedAt).toLocaleDateString('mn-MN')} · {s.childKey} ·{' '}
        <span className="font-mono">{s.modelName}</span>
      </p>

      {s.images.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-medium text-text-muted">Зураг ({s.images.length})</h2>
          <div className="flex flex-wrap gap-3">
            {s.images.map((img) => (
              <AuthImage
                key={img.id}
                path={`/api/screenings/${s.id}/image/${img.order}`}
                alt="Скрининг зураг"
                className="max-h-72 w-auto rounded-xl border border-border object-contain"
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="mb-2 text-sm font-medium text-text-muted">Илрэл ({s.findings.length})</h2>
        <ul className="flex flex-col gap-1 text-sm text-text-base">
          {s.findings.map((f) => (
            <li key={f.id} className="flex gap-2">
              <span className="font-medium">{f.className}</span>
              <span className="text-text-muted">{(f.confidence * 100).toFixed(0)}%</span>
              {f.fdi ? <span className="font-mono text-text-muted">FDI {f.fdi}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {s.summary && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-medium text-text-muted">AI зөвлөмж</h2>
          <p className="text-sm leading-relaxed text-text-base">{s.summary.advice}</p>
          <dl className="mt-3 flex flex-col gap-2">
            {GUIDANCE_FIELDS.filter((g) => s.summary?.[g.key]).map((g) => (
              <div key={g.key}>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">{g.label}</dt>
                <dd className="text-sm leading-relaxed text-text-base">{s.summary?.[g.key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <ReviewForm screeningId={s.id} current={s.review?.confirmedLevel ?? null} />
      </div>
    </section>
  )
}

export default ScreeningChartPage
