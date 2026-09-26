import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import api from '../lib/api'

export interface ParsedMutualFundHolding {
  fundName: string
  amcName: string
  category: string
  subCategory: string
  planType: string
  optionType: string
  nav: number
  units: number
  investedValue: number
  currentValue: number
  weightPct: number
  pnl: number
  pnlPct: number
  xirrPct: number
  investedSince: string
  asOfDate: string
  isDuplicate?: boolean
}

export interface MutualFundHoldingsParseResult {
  fileName: string
  asOfDate: string
  holdings: ParsedMutualFundHolding[]
  newCount: number
  duplicateCount: number
}

export interface MutualFundHolding extends ParsedMutualFundHolding {
  id: string
}

async function parseOne (file: File): Promise<MutualFundHoldingsParseResult> {
  const form = new FormData()
  form.append('file', file)
  try {
    const res = await api.post<{ data: MutualFundHoldingsParseResult }>('/mutual-fund-holdings/parse', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  } catch (e) {
    if (isAxiosError<{ error?: string }>(e) && e.response?.data?.error) {
      throw new Error(e.response.data.error)
    }
    throw e
  }
}

export function useParseMutualFundHoldingsFile () {
  return useMutation<MutualFundHoldingsParseResult, Error, File>({ mutationFn: parseOne })
}

export function useSaveMutualFundHoldings () {
  const qc = useQueryClient()
  return useMutation<{ created: number; updated: number }, Error, ParsedMutualFundHolding[]>({
    mutationFn: async (holdings) => {
      const res = await api.post<{ data: { created: number; updated: number } }>('/mutual-fund-holdings/save-batch', { holdings })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mutual-fund-holdings'] })
    },
  })
}

export function useMutualFundHoldings (asOfDate?: string) {
  return useQuery<MutualFundHolding[]>({
    queryKey: ['mutual-fund-holdings', 'list', asOfDate ?? 'latest'],
    queryFn: async () => {
      const params = asOfDate ? `?asOfDate=${asOfDate}` : ''
      const res = await api.get<{ data: MutualFundHolding[] }>(`/mutual-fund-holdings${params}`)
      return res.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}
