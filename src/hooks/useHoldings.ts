import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees } from '../utils/money'
import type { Holding } from '../types/holdings'

const QUERY_KEY = ['holdings'] as const

interface ApiHolding {
  id: string
  name: string
  assetClass: Holding['assetClass']
  currentValue: number
  investedValue: number
  units?: number | null
  nav?: number | null
  notes?: string | null
  lastUpdated: string
}

function mapHolding(h: ApiHolding): Holding {
  return {
    id: h.id,
    name: h.name,
    assetClass: h.assetClass,
    currentValue: toRupees(h.currentValue),
    investedValue: toRupees(h.investedValue),
    units: h.units ?? undefined,
    nav: h.nav ?? undefined,
    notes: h.notes ?? undefined,
    lastUpdated: h.lastUpdated,
  }
}

export function useHoldings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiHolding[] }>('/holdings')
      return data.data.map(mapHolding)
    },
  })
}
