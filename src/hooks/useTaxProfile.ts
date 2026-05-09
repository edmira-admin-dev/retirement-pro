import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees, toPaise } from '../utils/money'
import type { TaxInputs } from '../types/tax'

export const TAX_QUERY_KEY = ['tax-profile'] as const

interface ApiTaxProfile {
  id: string
  realizedGainsFY: number       // paise
  unrealizedEquityGains: number // paise
}

function mapProfile(p: ApiTaxProfile): TaxInputs {
  return {
    realizedGainsFY: toRupees(p.realizedGainsFY),
    unrealizedEquityGains: toRupees(p.unrealizedEquityGains),
  }
}

export function useTaxProfile() {
  return useQuery({
    queryKey: TAX_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiTaxProfile | null }>('/tax')
      return data.data ? mapProfile(data.data) : null
    },
  })
}

export function useSaveTaxProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inputs: TaxInputs) => {
      const { data } = await api.put<{ data: ApiTaxProfile }>('/tax', {
        realizedGainsFY: toPaise(inputs.realizedGainsFY),
        unrealizedEquityGains: toPaise(inputs.unrealizedEquityGains),
      })
      return mapProfile(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEY }),
  })
}
