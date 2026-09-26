import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { AxiosError } from 'axios'

export interface StockSignal {
  symbol: string
  cmp: number
  pdh: number
  pdl: number
  pdc: number
  ema20: number
  ema50: number
  ema200: number
  rsi: number
  atr: number
  atrPct: number
  vol20dAvg: number
  volToday: number
  volRatio: number
  l1Trend: 'BULL_FULL' | 'BULL_PARTIAL' | 'BEAR_FULL' | 'BEAR_PARTIAL' | 'NEUTRAL'
  l2Volume: 'STRONG' | 'GOOD' | 'ACCEPTABLE' | 'WEAK'
  l3Structure: string
  l4PA: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  signal: 'BUY' | 'SHORT' | 'WATCH' | 'NO_TRADE'
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
  outcome?: SignalOutcome
}

export interface SignalOutcome {
  status: 'OPEN' | 'WIN_T1' | 'WIN_T2' | 'LOSS' | 'EXPIRED'
  evaluatedAt: string
  exitPrice?: number
  exitDate?: string
  daysHeld?: number
}

export interface SignalSuccessStats {
  total: number
  wins: number
  losses: number
  open: number
  expired: number
  winRatePct: number
  avgT1ReturnPct: number
  avgT2ReturnPct: number
  bySymbol: Array<{ symbol: string; total: number; wins: number; losses: number; winRatePct: number }>
}

function extractError(err: unknown): Error {
  const e = err as AxiosError<{ error?: string }>
  return new Error(e.response?.data?.error ?? e.message)
}

export function useSignalsForDate(date: string) {
  return useQuery<StockSignal[]>({
    queryKey: ['signals', date],
    queryFn: async () => {
      const res = await api.get<{ data: StockSignal[] | null }>(`/signals/${date}`)
      return res.data.data ?? []
    },
  })
}

export function useSignalDates() {
  return useQuery<string[]>({
    queryKey: ['signal-dates'],
    queryFn: async () => {
      const res = await api.get<{ data: string[] }>('/signals/dates')
      return res.data.data
    },
  })
}

export function useSignalStats() {
  return useQuery<SignalSuccessStats>({
    queryKey: ['signal-stats'],
    queryFn: async () => {
      const res = await api.get<{ data: SignalSuccessStats }>('/signals/stats')
      return res.data.data
    },
  })
}

export function useEvaluateSignals() {
  const qc = useQueryClient()
  return useMutation<{ rowsUpdated: number; signalsEvaluated: number }, Error>({
    mutationFn: async () => {
      const res = await api.post<{ data: { rowsUpdated: number; signalsEvaluated: number } }>('/signals/evaluate').catch(e => { throw extractError(e) })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signals'] })
      qc.invalidateQueries({ queryKey: ['signal-stats'] })
    },
  })
}

export function useGenerateSignals() {
  const qc = useQueryClient()
  return useMutation<StockSignal[], Error>({
    mutationFn: async () => {
      const res = await api.post<{ data: StockSignal[] }>('/signals/generate').catch(e => { throw extractError(e) })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signals'] })
      qc.invalidateQueries({ queryKey: ['signal-dates'] })
    },
  })
}
