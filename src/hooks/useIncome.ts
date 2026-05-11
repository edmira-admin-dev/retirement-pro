import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { IncomeRecord, IncomeCategory, RecurringFrequency, IncomeSummary } from '../types/income'

export const INCOME_KEY = ['income'] as const

export interface IncomePayload {
  source: string
  amountPaise: number
  category: IncomeCategory
  date: string
  recurring: boolean
  frequency: RecurringFrequency
  notes?: string | null
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: INCOME_KEY })
  qc.invalidateQueries({ queryKey: ['networth'] })
  qc.invalidateQueries({ queryKey: ['cashflow'] })
}

export function useIncome(month: string, category?: IncomeCategory) {
  return useQuery({
    queryKey: [...INCOME_KEY, month, category ?? ''],
    queryFn: async () => {
      const params: Record<string, string> = { month }
      if (category) params.category = category
      const { data } = await api.get<{ data: IncomeRecord[] }>('/income', { params })
      return data.data
    },
  })
}

export function useIncomeSummary(month: string) {
  return useQuery({
    queryKey: [...INCOME_KEY, 'summary', month],
    queryFn: async () => {
      const { data } = await api.get<{ data: IncomeSummary }>('/income/summary', { params: { month } })
      return data.data
    },
  })
}

export function useAddIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: IncomePayload) => {
      const { data } = await api.post<{ data: IncomeRecord }>('/income', input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useUpdateIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<IncomePayload>) => {
      const { data } = await api.patch<{ data: IncomeRecord }>(`/income/${id}`, input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/income/${id}`)
    },
    onSuccess: () => invalidateAll(qc),
  })
}
