import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees, toPaise } from '../utils/money'
import type { Holding, HoldingInput } from '../types/holdings'

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

export function useAddHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: HoldingInput) => {
      const { data } = await api.post<{ data: ApiHolding }>('/holdings', {
        ...input,
        currentValue: toPaise(input.currentValue),
        investedValue: toPaise(input.investedValue),
      })
      return mapHolding(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<HoldingInput> }) => {
      const body: Record<string, unknown> = { ...input }
      if (input.currentValue !== undefined) body.currentValue = toPaise(input.currentValue)
      if (input.investedValue !== undefined) body.investedValue = toPaise(input.investedValue)
      const { data } = await api.patch<{ data: ApiHolding }>(`/holdings/${id}`, body)
      return mapHolding(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteHolding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/holdings/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
