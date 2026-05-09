import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees, toPaise } from '../utils/money'
import type { Goal, GoalInput } from '../types/goals'

export const GOALS_QUERY_KEY = ['goals'] as const

interface ApiGoal {
  id: string
  name: string
  category: Goal['category']
  targetAmount: number      // paise
  targetYear: number
  currentAllocation: number // paise
  inflationRate: number
  notes?: string | null
}

function mapGoal(g: ApiGoal): Goal {
  return {
    id: g.id,
    name: g.name,
    category: g.category,
    targetAmount: toRupees(g.targetAmount),
    targetYear: g.targetYear,
    currentAllocation: toRupees(g.currentAllocation),
    inflationRate: g.inflationRate,
    notes: g.notes ?? undefined,
  }
}

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiGoal[] }>('/goals')
      return data.data.map(mapGoal)
    },
  })
}

export function useAddGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: GoalInput) => {
      const { data } = await api.post<{ data: ApiGoal }>('/goals', {
        ...input,
        targetAmount: toPaise(input.targetAmount),
        currentAllocation: toPaise(input.currentAllocation),
      })
      return mapGoal(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<GoalInput> }) => {
      const body: Record<string, unknown> = { ...input }
      if (input.targetAmount !== undefined) body.targetAmount = toPaise(input.targetAmount)
      if (input.currentAllocation !== undefined) body.currentAllocation = toPaise(input.currentAllocation)
      const { data } = await api.patch<{ data: ApiGoal }>(`/goals/${id}`, body)
      return mapGoal(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY }),
  })
}
