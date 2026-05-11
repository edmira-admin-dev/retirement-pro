import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Holding } from '../types/holdings'
import { toRupees } from '../utils/money'

interface GrowwStatus {
  connected: boolean
  tokenExpired: boolean
  lastSyncedAt: string | null
  syncSummary: {
    holdingsSynced: number
    tradesSynced: number
    duplicatesSkipped: number
  } | null
  errorMessage: string | null
}

interface SyncResult {
  holdings: { synced: number; skipped: number }
  trades: { synced: number; skipped: number }
  errors: string[]
}

interface ApiHolding {
  id: string
  name: string
  assetClass: Holding['assetClass']
  currentValue: number
  investedValue: number
  units?: number | null
  notes?: string | null
  lastUpdated: string
}

function mapHolding(h: ApiHolding): Holding {
  return {
    id: h.id,
    name: h.name,
    assetClass: h.assetClass,
    currentValue: toRupees(h.currentValue),
    investedValue: toRupees(h.investedValue),
    units: h.units ?? undefined,
    notes: h.notes ?? undefined,
    lastUpdated: h.lastUpdated,
  }
}

export function useGrowwStatus () {
  return useQuery<GrowwStatus>({
    queryKey: ['groww', 'status'],
    queryFn: async () => {
      const res = await api.get<{ data: GrowwStatus }>('/integrations/groww/status')
      return res.data.data
    }
  })
}

export function useGrowwHoldings () {
  return useQuery<Holding[]>({
    queryKey: ['groww', 'holdings'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiHolding[] }>('/integrations/groww/holdings')
      return res.data.data.map(mapHolding)
    }
  })
}

export function useGrowwConnect () {
  const qc = useQueryClient()
  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post('/integrations/groww/connect')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groww'] })
      qc.invalidateQueries({ queryKey: ['integrations'] })
    }
  })
}

export function useGrowwRefreshToken () {
  const qc = useQueryClient()
  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post('/integrations/groww/refresh-token')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groww'] })
    }
  })
}

export function useGrowwSync () {
  const qc = useQueryClient()
  return useMutation<SyncResult, Error>({
    mutationFn: async () => {
      const res = await api.post<{ data: SyncResult }>('/integrations/groww/sync')
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groww'] })
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['networth'] })
      qc.invalidateQueries({ queryKey: ['integrations'] })
      qc.invalidateQueries({ queryKey: ['holdings'] })
    }
  })
}
