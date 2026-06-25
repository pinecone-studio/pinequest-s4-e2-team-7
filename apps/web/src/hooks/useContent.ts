import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export type ContentVersion = {
  id: string
  version: string
  locale: string
  status: string // 'draft' | 'published'
  notes: string | null
  publishedAt: string
  publishedById: string
}

export const useContent = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['content'],
    queryFn: () => apiFetch<ContentVersion[]>('/api/content', { token }),
    enabled: !!token,
  })
}

export const useCreateContent = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { version: string; locale?: string; notes?: string }) =>
      apiFetch<ContentVersion>('/api/content', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  })
}

export const usePublishContent = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<ContentVersion>(`/api/content/${id}/publish`, { token, method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  })
}
