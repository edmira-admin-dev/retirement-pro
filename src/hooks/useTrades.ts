import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Trade, Position, PnLSummary, TradePayload, TradeFilters, KiteHolding } from '../types/trade'

export const TRADES_KEY = ['trades'] as const

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: TRADES_KEY })
}

export function useTrades(filters: TradeFilters = {}) {
  return useQuery({
    queryKey: [...TRADES_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters.symbol) params.symbol = filters.symbol
      if (filters.segment) params.segment = filters.segment
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      const { data } = await api.get<{ data: Trade[] }>('/trades', { params })
      return data.data
    },
  })
}

export function usePositions() {
  return useQuery({
    queryKey: [...TRADES_KEY, 'positions'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Position[] }>('/trades/positions')
      return data.data
    },
  })
}

export function usePnLSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: [...TRADES_KEY, 'pnl', from ?? '', to ?? ''],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (from) params.from = from
      if (to) params.to = to
      const { data } = await api.get<{ data: PnLSummary }>('/trades/pnl', { params })
      return data.data
    },
  })
}

export function useAddTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TradePayload) => {
      const { data } = await api.post<{ data: Trade }>('/trades', input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useUpdateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<TradePayload>) => {
      const { data } = await api.patch<{ data: Trade }>(`/trades/${id}`, input)
      return data.data
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trades/${id}`)
    },
    onSuccess: () => invalidateAll(qc),
  })
}

export function useKiteHoldings() {
  return useQuery({
    queryKey: ['kite', 'holdings'],
    queryFn: async () => {
      const { data } = await api.get<{ data: KiteHolding[] }>('/integrations/kite/holdings')
      return data.data
    },
    retry: false,
  })
}

export function useUpdateLtp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ symbol, ltpPaise }: { symbol: string; ltpPaise: number }) => {
      await api.patch(`/trades/positions/${symbol}/ltp`, { ltpPaise })
    },
    onSuccess: () => invalidateAll(qc),
  })
}
