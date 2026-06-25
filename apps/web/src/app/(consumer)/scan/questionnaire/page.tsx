'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { QuestionProgress, RadioCard } from '@/components/consumer/MobilePatterns'
import Button from '@/components/ui/Button'
import {
  getQuestionnaire,
  saveQuestionnaire,
  type PainSince,
  type PainWhen,
} from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

const VISIT_OPTIONS = [
  { value: 'lt6m', label: '6 сараас бага' },
  { value: '6-12m', label: '6–12 сар' },
  { value: 'gt12m', label: '1 жилээс дээш' },
  { value: 'never', label: 'Хэзээ ч үзүүлээгүй' },
] as const

const PAIN_WHEN_OPTIONS: { value: PainWhen; label: string }[] = [
  { value: 'cold', label: 'Хүйтэн зүйл идэхэд өвддөг' },
  { value: 'hot', label: 'Халуун зүйл идэхэд өвддөг' },
  { value: 'spontaneous', label: 'Өөрөө аяндаа өвддөг' },
  { value: 'night', label: 'Шөнө өвддөг' },
  { value: 'pressure', label: 'Дарахад өвддөг' },
]

const PAIN_SINCE_OPTIONS: { value: PainSince; label: string }[] = [
  { value: 'yesterday', label: 'Өчигдрөөс' },
  { value: '2days', label: '2 хоног' },
  { value: '4days', label: '4 хоног' },
]

type StepId = 'child' | 'visit' | 'painGate' | 'painWhen' | 'painSince' | 'feverSwelling'

const buildSteps = (hasPainfulTooth: 'yes' | 'no'): StepId[] => {
  const steps: StepId[] = ['child', 'visit', 'painGate']
  if (hasPainfulTooth === 'yes') steps.push('painWhen', 'painSince', 'feverSwelling')
  return steps
}

const ScanQuestionnairePage = () => {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [childName, setChildName] = useState('')
  const [age, setAge] = useState('')
  const [lastDentalVisit, setLastDentalVisit] = useState('')
  const [hasPainfulTooth, setHasPainfulTooth] = useState<'yes' | 'no'>('no')
  const [painWhen, setPainWhen] = useState<PainWhen | ''>('')
  const [painSince, setPainSince] = useState<PainSince | ''>('')
  const [feverSwelling, setFeverSwelling] = useState<'yes' | 'no' | ''>('')

  useEffect(() => {
    const saved = getQuestionnaire()
    if (!saved) return
    setChildName(saved.childName)
    setAge(saved.age)
    setLastDentalVisit(saved.lastDentalVisit)
    setHasPainfulTooth(saved.hasPainfulTooth)
    if (saved.painWhen) setPainWhen(saved.painWhen)
    if (saved.painSince) setPainSince(saved.painSince)
    if (saved.feverSwelling) setFeverSwelling(saved.feverSwelling)
  }, [])

  const steps = useMemo(() => buildSteps(hasPainfulTooth), [hasPainfulTooth])
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)] ?? 'child'
  const totalSteps = steps.length

  useEffect(() => {
    if (stepIndex >= steps.length) setStepIndex(steps.length - 1)
  }, [stepIndex, steps.length])

  const finish = () => {
    saveQuestionnaire({
      childName,
      age,
      lastDentalVisit,
      hasPainfulTooth,
      ...(hasPainfulTooth === 'yes'
        ? {
            painWhen: painWhen as PainWhen,
            painSince: painSince as PainSince,
            feverSwelling: feverSwelling as 'yes' | 'no',
          }
        : {}),
    })
    router.push(ROUTES.scan.camera)
  }

  const next = () => {
    if (currentStep === 'painGate' && hasPainfulTooth === 'no') {
      finish()
      return
    }
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1)
    else finish()
  }

  const back = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  const canNext =
    currentStep === 'child'
      ? Boolean(childName.trim() && age.trim())
      : currentStep === 'visit'
        ? Boolean(lastDentalVisit)
        : currentStep === 'painGate'
          ? true
          : currentStep === 'painWhen'
            ? Boolean(painWhen)
            : currentStep === 'painSince'
              ? Boolean(painSince)
              : currentStep === 'feverSwelling'
                ? Boolean(feverSwelling)
                : true

  const isLastStep = currentStep === 'painGate' ? hasPainfulTooth === 'no' : stepIndex === steps.length - 1

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.home}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-muted shadow-sm ring-1 ring-border transition hover:bg-surface-raised"
          aria-label="Буцах"
        >
          ←
        </Link>
        <h1 className="text-[20px] font-bold text-text-base">Асуумж</h1>
      </div>

      <QuestionProgress step={stepIndex + 1} total={totalSteps} />

      {currentStep === 'child' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Хүүхдийн мэдээлэл</p>
          </div>
          <label className="block space-y-2">
            <span className="text-[13px] font-medium text-text-muted">Хүүхдийн нэр</span>
            <input required value={childName} onChange={(e) => setChildName(e.target.value)} className="consumer-input" />
          </label>
          <label className="block space-y-2">
            <span className="text-[13px] font-medium text-text-muted">Нас</span>
            <input
              required
              type="number"
              min={3}
              max={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="consumer-input"
            />
          </label>
        </div>
      ) : null}

      {currentStep === 'visit' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Сүүлд эмчид үзүүлсэн хугацаа?</p>
          </div>
          <div className="space-y-2">
            {VISIT_OPTIONS.map(({ value, label }) => (
              <RadioCard
                key={value}
                name="visit"
                value={value}
                label={label}
                checked={lastDentalVisit === value}
                onChange={() => setLastDentalVisit(value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 'painGate' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Өвддөг шүд байгаа юу?</p>
            <p className="mt-2 text-[13px] text-text-muted">
              «Үгүй» гэвэл өвдөлтийн асуултуудыг алгасаад үргэлжлүүлнэ.
            </p>
          </div>
          <RadioCard
            name="painfulTooth"
            value="no"
            label="Үгүй"
            checked={hasPainfulTooth === 'no'}
            onChange={() => setHasPainfulTooth('no')}
          />
          <RadioCard
            name="painfulTooth"
            value="yes"
            label="Тийм"
            checked={hasPainfulTooth === 'yes'}
            onChange={() => setHasPainfulTooth('yes')}
          />
        </div>
      ) : null}

      {currentStep === 'painWhen' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Ямар үед өвддөг вэ?</p>
          </div>
          <div className="space-y-2">
            {PAIN_WHEN_OPTIONS.map(({ value, label }) => (
              <RadioCard
                key={value}
                name="painWhen"
                value={value}
                label={label}
                checked={painWhen === value}
                onChange={() => setPainWhen(value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 'painSince' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Хэзээнээс өвдөж эхлэсэн бэ?</p>
          </div>
          <div className="space-y-2">
            {PAIN_SINCE_OPTIONS.map(({ value, label }) => (
              <RadioCard
                key={value}
                name="painSince"
                value={value}
                label={label}
                checked={painSince === value}
                onChange={() => setPainSince(value)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 'feverSwelling' ? (
        <div className="space-y-4">
          <div className="warm-card p-5">
            <p className="text-[18px] font-semibold leading-snug text-text-base">Халуурч нүүр хавдсан уу?</p>
          </div>
          <RadioCard
            name="feverSwelling"
            value="no"
            label="Үгүй"
            checked={feverSwelling === 'no'}
            onChange={() => setFeverSwelling('no')}
          />
          <RadioCard
            name="feverSwelling"
            value="yes"
            label="Тийм"
            checked={feverSwelling === 'yes'}
            onChange={() => setFeverSwelling('yes')}
          />
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        {stepIndex > 0 ? (
          <Button type="button" variant="secondary" className="flex-1 rounded-full" onClick={back}>
            Буцах
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1 rounded-full bg-[#F3B900] text-slate-900 hover:bg-[#E5AD00]"
          disabled={!canNext}
          onClick={next}
        >
          {isLastStep ? 'Хадгалж камер руу үргэлжлүүлэх' : 'Дараах'}
        </Button>
      </div>
    </div>
  )
}

export default ScanQuestionnairePage
