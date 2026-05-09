import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees, toPaise } from '../utils/money'
import type { HealthInputs } from '../types/health'

export const HEALTH_QUERY_KEY = ['health-profile'] as const

interface ApiHealthProfile {
  id: string
  monthlyIncome: number
  monthlyExpenses: number
  monthlyEMIs: number
  liquidAssets: number
  totalLiabilities: number
  monthlySavings: number
  hasTermInsurance: boolean
  hasHealthInsurance: boolean
  hasWill: boolean
  hasNominations: boolean
}

function mapProfile(p: ApiHealthProfile): HealthInputs {
  return {
    monthlyIncome: toRupees(p.monthlyIncome),
    monthlyExpenses: toRupees(p.monthlyExpenses),
    monthlyEMIs: toRupees(p.monthlyEMIs),
    liquidAssets: toRupees(p.liquidAssets),
    totalLiabilities: toRupees(p.totalLiabilities),
    monthlySavings: toRupees(p.monthlySavings),
    hasTermInsurance: p.hasTermInsurance,
    hasHealthInsurance: p.hasHealthInsurance,
    hasWill: p.hasWill,
    hasNominations: p.hasNominations,
  }
}

export function useHealthProfile() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiHealthProfile | null }>('/health')
      return data.data ? mapProfile(data.data) : null
    },
  })
}

export function useSaveHealthProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inputs: HealthInputs) => {
      const { data } = await api.put<{ data: ApiHealthProfile }>('/health', {
        monthlyIncome: toPaise(inputs.monthlyIncome),
        monthlyExpenses: toPaise(inputs.monthlyExpenses),
        monthlyEMIs: toPaise(inputs.monthlyEMIs),
        liquidAssets: toPaise(inputs.liquidAssets),
        totalLiabilities: toPaise(inputs.totalLiabilities),
        monthlySavings: toPaise(inputs.monthlySavings),
        hasTermInsurance: inputs.hasTermInsurance,
        hasHealthInsurance: inputs.hasHealthInsurance,
        hasWill: inputs.hasWill,
        hasNominations: inputs.hasNominations,
      })
      return mapProfile(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEY }),
  })
}
