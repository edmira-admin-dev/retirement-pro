import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees } from '../utils/money'

interface ApiSnapshot {
  date: string
  value: number
}

export interface NetWorthPoint {
  date: string
  value: number
}

export const NET_WORTH_HISTORY_KEY = ['networth-history'] as const

export function useNetWorthHistory() {
  return useQuery({
    queryKey: NET_WORTH_HISTORY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiSnapshot[] }>('/networth/snapshots')
      return data.data.map((s) => ({
        date: s.date,
        value: toRupees(s.value),
      })) as NetWorthPoint[]
    },
  })
}
