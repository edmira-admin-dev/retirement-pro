import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { AxiosError } from 'axios'

export interface VCPContraction {
  high: number
  low: number
  rangePct: number
}

export interface VCPStockSignal {
  symbol: string
  cmp: number
  sma50: number
  sma150: number
  sma200: number
  week52High: number
  week52Low: number
  pctFrom52wHigh: number
  pctAbove52wLow: number
  trendTemplateScore: number
  trendTemplateMax: number
  contractions: VCPContraction[]
  pivot: number
  volDryUpRatio: number
  volRatioToday: number
  signal: 'BUY' | 'WATCH' | 'NO_SETUP'
  reasoning: string
  entry: number
  stopLoss: number
  target1: number
  target2: number
  riskPct: number
  t1ReturnPct: number
  t2ReturnPct: number
  holdDays: string
  error?: string
}

function extractError(err: unknown): Error {
  const e = err as AxiosError<{ error?: string }>
  return new Error(e.response?.data?.error ?? e.message)
}

export function useVCPSignalsForDate(date: string) {
  return useQuery<VCPStockSignal[]>({
    queryKey: ['vcp-signals', date],
    queryFn: async () => {
      const res = await api.get<{ data: VCPStockSignal[] | null }>(`/vcp-signals/${date}`)
      return res.data.data ?? []
    },
  })
}

export function useVCPSignalDates() {
  return useQuery<string[]>({
    queryKey: ['vcp-signal-dates'],
    queryFn: async () => {
      const res = await api.get<{ data: string[] }>('/vcp-signals/dates')
      return res.data.data
    },
  })
}

export function useGenerateVCPSignals() {
  const qc = useQueryClient()
  return useMutation<VCPStockSignal[], Error>({
    mutationFn: async () => {
      const res = await api.post<{ data: VCPStockSignal[] }>('/vcp-signals/generate').catch(e => { throw extractError(e) })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vcp-signals'] })
      qc.invalidateQueries({ queryKey: ['vcp-signal-dates'] })
    },
  })
}
