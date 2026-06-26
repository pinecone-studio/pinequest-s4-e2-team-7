import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'
import { useToast } from '@/components/ui/Toast'

export type Me = { id: string; name: string; email: string; role: UserRole; phone: string | null }

export const useMe = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('/api/auth/me', { token }),
    enabled: !!token,
  })
}

export const useUpdateMe = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (vars: { name?: string; phone?: string; email?: string }) =>
      apiFetch<unknown>('/api/auth/me', { token, method: 'PATCH', body: vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); toast.success('Профайл шинэчлэгдлээ') },
    onError: () => toast.error('Алдаа гарлаа'),
  })
}
