import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { ExpenseRecord, ExpenseType, ExpenseCategory, ExpenseSummary } from '../types/expense'

export const EXPENSE_KEY = ['expenses'] as const

export interface ExpensePayload {
  merchant: string
  amountPaise: number
  expenseType: ExpenseType
  category: ExpenseCategory
  date: string
  recurring: boolean
  notes?: string | null
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: EXPENSE_KEY })
  qc.invalidateQueries({ queryKey: ['networth'] })
  qc.invalidateQueries({ queryKey: ['cashflow'] })
}

interface ExpenseFilters {
  month: string
  type?: ExpenseType | ''
  category?: ExpenseCategory | ''
  q?: string
}

export function useExpenses({ month, type, category, q }: ExpenseFilters) {
  return useQuery({
    queryKey: [...EXPENSE_KEY, month, type ?? '', category ?? '', q ?? ''],
    queryFn: async () => {
      const params: Record<string, string> = { month }
      if (type) params.type = type
      if (category) params.category = category
      if (q) params.q = q
      const { data } = await api.get<{ data: ExpenseRecord[] }>('/expenses', { params })
      return data.data
    },
  })
}

export function useExpenseSummary(month: string) {
  return useQuery({
    queryKey: [...EXPENSE_KEY, 'summary', month],
    queryFn: async () => {
      const { data } = await api.get<{ data: ExpenseSummary }>('/expenses/summary', { params: { month } })
      return data.data
    },
  })
}

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ExpensePayload) => {
      const { data } = await api.post<{ data: ExpenseRecord }>('/expenses', input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<ExpensePayload>) => {
      const { data } = await api.patch<{ data: ExpenseRecord }>(`/expenses/${id}`, input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`)
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useCopyFromPreviousMonth(month: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<number> => {
      const [y, m] = month.split('-').map(Number)
      const prevDate = new Date(y, m - 2)
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
      const daysInCurrent = new Date(y, m, 0).getDate()

      const { data: res } = await api.get<{ data: ExpenseRecord[] }>('/expenses', { params: { month: prevMonth } })
      if (!res.data.length) return 0

      const payload = res.data.map((r) => {
        const prevDay = parseInt(r.date.slice(8, 10), 10)
        const day = Math.min(prevDay, daysInCurrent)
        return {
          merchant: r.merchant,
          amountPaise: r.amountPaise,
          expenseType: r.expenseType,
          category: r.category,
          date: `${month}-${String(day).padStart(2, '0')}`,
          recurring: r.recurring,
          notes: r.notes,
        }
      })

      await api.post('/expenses', payload)
      return payload.length
    },
    onSuccess: () => invalidateAll(qc),
  })
}
