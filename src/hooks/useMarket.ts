import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export type LtpMap = Record<string, number | null>

export interface LtpResponse {
  data: LtpMap
  error?: string
}

export function useLTP (symbols: string[]) {
  const key = symbols.slice().sort().join(',')
  return useQuery<LtpResponse>({
    queryKey: ['market', 'ltp', key],
    queryFn: async () => {
      const res = await api.get<LtpResponse>(`/market/ltp?symbols=${encodeURIComponent(key)}`)
      return res.data
    },
    enabled: symbols.length > 0,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export type IndexKey = 'NIFTY50' | 'NIFTY_100' | 'NIFTY_NEXT_50' | 'NIFTY_MIDCAP_150' | 'NIFTY_500' | 'NIFTY500_MOMENTUM_50'

export interface IndexMeta {
  key: IndexKey
  label: string
}

export interface SectorAllocationEntry {
  sector: string
  count: number
  weightPct: number
}

export interface IndexSectorAllocation {
  index: IndexKey
  label: string
  constituentCount: number
  sectors: SectorAllocationEntry[]
  asOfDate?: string
  source?: string
}

export function useIndices () {
  return useQuery<IndexMeta[]>({
    queryKey: ['market', 'indices'],
    queryFn: async () => {
      const res = await api.get<{ data: IndexMeta[] }>('/market/indices')
      return res.data.data
    },
    staleTime: Infinity,
  })
}

export function useIndexSectorAllocation (index: IndexKey | undefined) {
  return useQuery<IndexSectorAllocation>({
    queryKey: ['market', 'index-sector-allocation', index],
    queryFn: async () => {
      const res = await api.get<{ data: IndexSectorAllocation }>(`/market/index-sector-allocation?index=${index}`)
      return res.data.data
    },
    enabled: !!index,
    staleTime: 30 * 60 * 1000,
  })
}

export type ReturnPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL'

export interface IndexReturns {
  index: IndexKey
  label: string
  asOfDate: string
  latestClose: number
  returns: Partial<Record<ReturnPeriod, number>>
  note?: string
  error?: string
}

export function useBenchmarkReturns () {
  return useQuery<IndexReturns[]>({
    queryKey: ['market', 'benchmark-returns'],
    queryFn: async () => {
      const res = await api.get<{ data: IndexReturns[] }>('/market/benchmark-returns')
      return res.data.data
    },
    staleTime: 15 * 60 * 1000,
  })
}
