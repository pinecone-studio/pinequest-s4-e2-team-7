'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from './useAuth'
import { authErrorText, inputCls, submitCls } from './authConfig'
import Spinner from '@/components/ui/Spinner'

/** Login by email OR phone (the API accepts either as the identifier). */
const LoginForm = ({ onDone, defaultIdentifier = 'admin@screener.mn', defaultPassword = '' }: { onDone: () => void; defaultIdentifier?: string; defaultPassword?: string }) => {
  const { submit, busy, error } = useAuth(onDone)
  const [identifier, setIdentifier] = useState(defaultIdentifier)
  const [password, setPassword] = useState(defaultPassword)
  const [errs, setErrs] = useState<{ id?: string; pw?: string }>({})

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next: typeof errs = {}
    if (!identifier.trim()) next.id = 'Имэйл эсвэл утсаа оруулна уу'
    if (!password) next.pw = 'Нууц үгээ оруулна уу'
    setErrs(next)
    if (Object.keys(next).length) return
    submit('/api/auth/login', { email: identifier.trim(), password })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <input
        value={identifier}
        onChange={(e) => { setIdentifier(e.target.value); setErrs((p) => ({ ...p, id: '' })) }}
        placeholder="Имэйл эсвэл утасны дугаар"
        autoComplete="username"
        className={inputCls + (errs.id ? ' !border-triage-red' : '')}
      />
      {errs.id && <p className="-mt-2 text-[12px] text-triage-red">{errs.id}</p>}
      <input
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrs((p) => ({ ...p, pw: '' })) }}
        placeholder="Нууц үг"
        autoComplete="current-password"
        className={inputCls + (errs.pw ? ' !border-triage-red' : '')}
      />
      {errs.pw && <p className="-mt-2 text-[12px] text-triage-red">{errs.pw}</p>}
      {error && <p className="text-[13px] text-triage-red">{authErrorText(error)}</p>}
      <button type="submit" disabled={busy} className={submitCls}>
        {busy ? <Spinner /> : 'Нэвтрэх'}
      </button>
    </form>
  )
}

export default LoginForm
