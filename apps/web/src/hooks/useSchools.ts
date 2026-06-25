import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { School } from '@pinequest/types'
import { apiFetch } from '@/lib/api'
import { useSession } from '@/components/providers'

export const useSchools = () => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => apiFetch<School[]>('/api/schools', { token }),
    enabled: !!token,
  })
}

export const useSchool = (schoolId: string) => {
  const { token } = useSession()
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: () => apiFetch<School>(`/api/schools/${schoolId}`, { token }),
    enabled: !!token && !!schoolId,
  })
}

export const useCreateSchool = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; soumCode?: string; district?: string }) =>
      apiFetch<School>('/api/schools', { token, method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  })
}

/** Rename or archive (isActive:false) a school — powers Cohorts edit/delete. */
export const usePatchSchool = () => {
  const { token } = useSession()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; name?: string; isActive?: boolean }) => {
      const { id, ...body } = vars
      return apiFetch<School>(`/api/schools/${id}`, { token, method: 'PATCH', body })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  })
}
