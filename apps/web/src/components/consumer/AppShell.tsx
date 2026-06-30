'use client'

import Link from 'next/link'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

type PageHeaderProps = {
  title: string
  subtitle?: string
  backHref?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  eyebrow?: string
}

export const PageHeader = ({ title, subtitle, backHref, breadcrumbs, eyebrow }: PageHeaderProps) => {
  return (
    <div className="mb-10">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-[12px] text-text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRightIcon className="size-3" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-[#52A075]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-base">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex items-start gap-4">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-200 hover:bg-surface-raised"
            aria-label="Буцах"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
        ) : null}
        <div>
          {eyebrow ? <p className="warm-section-label mb-2">{eyebrow}</p> : null}
          <h2 className="text-[28px] font-bold tracking-tight text-text-base">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-text-muted">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  )
}

export const AppShell = ({
  title,
  subtitle,
  backHref,
  eyebrow,
  children,
}: {
  title: string
  subtitle?: string
  backHref?: string
  eyebrow?: string
  children: React.ReactNode
}) => (
  <div className="mx-auto w-full max-w-5xl">
    <PageHeader title={title} subtitle={subtitle} backHref={backHref} eyebrow={eyebrow} />
    {children}
  </div>
)

export const FlowCard = ({
  href,
  title,
  desc,
  emoji,
  accent = 'default',
}: {
  href: string
  title: string
  desc: string
  emoji: string
  accent?: 'default' | 'dark' | 'gold'
}) => {
  const accentCls =
    accent === 'dark'
      ? 'bg-slate-900 text-white hover:opacity-95'
      : accent === 'gold'
        ? 'bg-[#52A075] text-slate-900 hover:bg-[#3B8C5E]'
        : 'bg-surface text-text-base hover:bg-surface-raised'

  const descCls = accent === 'default' ? 'text-text-muted' : 'opacity-80'

  return (
    <Link
      href={href}
      className={`warm-card group flex min-h-[128px] flex-col justify-between p-6 transition-all duration-200 ${accentCls}`}
    >
      <span className="text-3xl">{emoji}</span>
      <span>
        <span className="block text-[16px] font-semibold">{title}</span>
        <span className={`mt-1 block text-[13px] leading-relaxed ${descCls}`}>{desc}</span>
      </span>
    </Link>
  )
}

export const StatusPill = ({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'yellow' | 'red' | 'neutral'
}) => {
  const cls =
    tone === 'green'
      ? 'bg-triage-green-bg text-triage-green ring-1 ring-triage-green/20'
      : tone === 'yellow'
        ? 'bg-triage-yellow-bg text-triage-yellow ring-1 ring-triage-yellow/20'
        : tone === 'red'
          ? 'bg-triage-red-bg text-triage-red ring-1 ring-triage-red/20'
          : 'bg-surface-raised text-text-muted ring-1 ring-border'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

export const StatCard = ({
  label,
  value,
  hint,
  progress,
}: {
  label: string
  value: string
  hint?: string
  progress?: number
}) => (
  <div className="warm-card p-6">
    <p className="warm-section-label">{label}</p>
    <p className="mt-2 text-[28px] font-bold tracking-tight text-text-base">{value}</p>
    {hint ? <p className="mt-1 text-[13px] text-text-muted">{hint}</p> : null}
    {progress !== undefined ? (
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-consumer-chrome">
        <div
          className="h-full rounded-full bg-[#52A075] transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    ) : null}
  </div>
)
