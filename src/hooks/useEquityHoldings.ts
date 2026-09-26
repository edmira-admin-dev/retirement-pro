import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface ParsedEquityHolding {
  symbol: string
  companyName: string
  sector: string
  industry: string
  subSector: string
  quantity: number
  avgCost: number
  ltp: number
  investedValue: number
  currentValue: number
  pnl: number
  pnlPct: number
  portfolioWeightPct: number
  dayChange: number
  dayChangePct: number
  asOfDate: string
  isDuplicate?: boolean
}

export interface EquityHoldingsParseResult {
  fileName: string
  asOfDate: string
  holdings: ParsedEquityHolding[]
  newCount: number
  duplicateCount: number
}

export interface EquityHolding extends ParsedEquityHolding {
  id: string
}

async function parseOne (file: File): Promise<EquityHoldingsParseResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<{ data: EquityHoldingsParseResult }>('/equity-holdings/parse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export function useParseEquityHoldingsFile () {
  return useMutation<EquityHoldingsParseResult, Error, File>({ mutationFn: parseOne })
}

export function useSaveEquityHoldings () {
  const qc = useQueryClient()
  return useMutation<{ created: number; updated: number }, Error, ParsedEquityHolding[]>({
    mutationFn: async (holdings) => {
      const res = await api.post<{ data: { created: number; updated: number } }>('/equity-holdings/save-batch', { holdings })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equity-holdings'] })
    },
  })
}

export function useEquityHoldings (asOfDate?: string) {
  return useQuery<EquityHolding[]>({
    queryKey: ['equity-holdings', 'list', asOfDate ?? 'latest'],
    queryFn: async () => {
      const params = asOfDate ? `?asOfDate=${asOfDate}` : ''
      const res = await api.get<{ data: EquityHolding[] }>(`/equity-holdings${params}`)
      return res.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}
