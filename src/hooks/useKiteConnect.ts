import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface KiteStatus {
  connected: boolean
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

export function useKiteStatus() {
  return useQuery<KiteStatus>({
    queryKey: ['kite', 'status'],
    queryFn: async () => {
      const res = await api.get<{ data: KiteStatus }>('/integrations/kite/status')
      return res.data.data
    },
  })
}

export function useKiteLoginUrl() {
  return useQuery<string>({
    queryKey: ['kite', 'login-url'],
    queryFn: async () => {
      const res = await api.get<{ data: { loginUrl: string } }>('/integrations/kite/login-url')
      return res.data.data.loginUrl
    },
    enabled: false, // only fetch on demand
  })
}

export function useKiteCallback() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (requestToken: string) => {
      await api.post('/integrations/kite/callback', { requestToken })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kite'] })
      qc.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

export function useKiteSync() {
  const qc = useQueryClient()
  return useMutation<SyncResult, Error>({
    mutationFn: async () => {
      const res = await api.post<{ data: SyncResult }>('/integrations/kite/sync')
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kite'] })
      qc.invalidateQueries({ queryKey: ['holdings'] })
      qc.invalidateQueries({ queryKey: ['trades'] })
      qc.invalidateQueries({ queryKey: ['networth'] })
      qc.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}
