'use client'

import { useState, type FormEvent } from 'react'
import type { UserRole } from '@pinequest/types'
import { useAuth } from './useAuth'
import { authErrorText, inputCls, submitCls, ROLE_OPTIONS } from './authConfig'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import Spinner from '@/components/ui/Spinner'

const NEEDS_SCHOOL: UserRole[] = ['teacher', 'school_doctor']

const ROLE_DD: DropdownOption<UserRole>[] = ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const INST_DD: DropdownOption<string>[] = [
  { value: 'Сургууль', label: 'Сургууль' },
  { value: 'Цэцэрлэг', label: 'Цэцэрлэг' },
  { value: 'other', label: 'Бусад' },
]

/** Self-registration: phone is the required identifier, email is optional. */
const RegisterForm = ({ onDone }: { onDone: () => void }) => {
  const { submit, busy, error } = useAuth(onDone)
  const [role, setRole] = useState<UserRole>('teacher')
  const [instType, setInstType] = useState<string>('Сургууль')
  const [f, setF] = useState({ name: '', phone: '', email: '', extra: '', password: '', confirm: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setF((p) => ({ ...p, [k]: e.target.value }))
    setErrs((p) => ({ ...p, [k]: '' }))
  }

  const schoolName = instType === 'other' ? f.extra.trim() : `${instType} ${f.extra.trim()}`.trim()

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {}
    if (!f.name.trim()) e.name = 'Нэрээ оруулна уу'
    if (NEEDS_SCHOOL.includes(role) && !f.extra.trim()) e.extra = instType === 'other' ? 'Байгууллагын нэрээ оруулна уу' : 'Дугаараа оруулна уу'
    if (role === 'parent' && !f.extra.trim()) e.extra = 'Хүүхдийн кодоо оруулна уу'
    if (!f.phone.trim()) e.phone = 'Утасны дугаараа оруулна уу'
    if (f.password.length < 6) e.password = '6+ тэмдэгт нууц үг оруулна уу'
    if (!f.confirm) e.confirm = 'Нууц үгээ давтана уу'
    else if (f.password !== f.confirm) e.confirm = 'Нууц үг таарахгүй байна'
    return e
  }

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const e = validate()
    setErrs(e)
    if (Object.keys(e).length) return
    submit('/api/auth/register', {
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim() || undefined,
      password: f.password,
      role,
      ...(NEEDS_SCHOOL.includes(role) ? { schoolName } : {}),
      ...(role === 'parent' ? { childCode: f.extra.trim() } : {}),
    })
  }

  const ec = (k: string) => (errs[k] ? ' !border-triage-red' : '')
  const Err = ({ k }: { k: string }) => (errs[k] ? <p className="-mt-2 text-[12px] text-triage-red">{errs[k]}</p> : null)

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <input value={f.name} onChange={set('name')} placeholder="Нэр" className={inputCls + ec('name')} />
      <Err k="name" />

      <Dropdown value={role} options={ROLE_DD} ariaLabel="Үүрэг" size="md"
        onChange={(v) => { setRole(v); setF((p) => ({ ...p, extra: '' })); setErrs((p) => ({ ...p, extra: '' })) }} />

      {NEEDS_SCHOOL.includes(role) && (
        <>
          <div className="flex gap-2">
            <Dropdown value={instType} options={INST_DD} ariaLabel="Байгууллагын төрөл" size="md" className="w-36 shrink-0"
              onChange={(v) => { setInstType(v); setF((p) => ({ ...p, extra: '' })); setErrs((p) => ({ ...p, extra: '' })) }} />
            {instType === 'other'
              ? <input value={f.extra} onChange={set('extra')} placeholder="Байгууллагын нэр" className={`${inputCls} flex-1${ec('extra')}`} />
              : <input type="number" inputMode="numeric" value={f.extra} onChange={set('extra')} placeholder="Дугаар" className={`${inputCls} flex-1${ec('extra')}`} />}
          </div>
          <Err k="extra" />
        </>
      )}

      {role === 'parent' && (<><input value={f.extra} onChange={set('extra')} placeholder="Хүүхдийн код" className={inputCls + ec('extra')} /><Err k="extra" /></>)}

      <input type="tel" value={f.phone} onChange={set('phone')} placeholder="Утасны дугаар" autoComplete="tel" className={inputCls + ec('phone')} />
      <Err k="phone" />
      <input type="email" value={f.email} onChange={set('email')} placeholder="Имэйл (заавал биш)" autoComplete="email" className={inputCls} />
      <input type="password" value={f.password} onChange={set('password')} placeholder="Нууц үг (6+ тэмдэгт)" autoComplete="new-password" className={inputCls + ec('password')} />
      <Err k="password" />
      <input type="password" value={f.confirm} onChange={set('confirm')} placeholder="Нууц үг давтах" autoComplete="new-password" className={inputCls + ec('confirm')} />
      <Err k="confirm" />

      {error && <p className="text-[13px] text-triage-red">{authErrorText(error)}</p>}
      <button type="submit" disabled={busy} className={submitCls}>
        {busy ? <Spinner /> : 'Бүртгүүлэх'}
      </button>
    </form>
  )
}

export default RegisterForm
