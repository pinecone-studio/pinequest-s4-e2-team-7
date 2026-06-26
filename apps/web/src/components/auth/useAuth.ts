'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { homeForRole, setToken } from '@/lib/auth'
import { useSession } from '@/components/providers'
import type { AuthData } from './authConfig'

/** Shared login/register submit: hit the API, store the token, redirect to the
 *  role's board, then close the modal. Keeps busy/error state for the forms. */
export const useAuth = (onDone: () => void) => {
  const router = useRouter()
  const { refresh } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (path: string, body: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>(path, { method: 'POST', body })
      setToken(data.token)
      refresh()
      onDone()
      router.push(homeForRole(data.user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network')
      setBusy(false) // keep the modal open so the user can retry
    }
  }

  return { submit, busy, error, setError }
}
