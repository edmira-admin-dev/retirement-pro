import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface UserPreferences {
  expenseViewMonth?: string | null
  incomeViewMonth?: string | null
}

const PREF_KEY = ['preferences'] as const

export function usePreferences() {
  return useQuery({
    queryKey: PREF_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: UserPreferences }>('/preferences')
      return data.data
    },
    staleTime: Infinity,
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const { data } = await api.patch<{ data: UserPreferences }>('/preferences', prefs)
      return data.data
    },
    onSuccess: (data) => {
      qc.setQueryData(PREF_KEY, data)
    },
  })
}
