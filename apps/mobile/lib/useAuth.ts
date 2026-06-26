import { useState } from 'react'
import { useRouter } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { saveToken, saveUser, type AuthUser } from '@/lib/auth'
import { toMongolian } from '@/lib/errorMessages'

type AuthData = { token: string; user: AuthUser }

export const useAuth = () => {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (path: string, body: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<AuthData>(path, { method: 'POST', body: JSON.stringify(body) })
      await saveToken(data.token)
      await saveUser(data.user)
      router.replace('/(tabs)')
    } catch (err) {
      setError(toMongolian(err))
      setBusy(false)
    }
  }

  return { submit, busy, error }
}
