import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface FactorReasoning {
  moat: string
  financial: string
  growth: string
  valuation: string
  mgmt: string
  earnings: string
  macro: string
  risk: string
  dividend: string
  liquidity: string
}

export type AiProvider = 'OPENAI' | 'GEMINI' | 'CLAUDE'

export interface ModelScore {
  id: string
  provider: AiProvider
  f1: number; f2: number; f3: number; f4: number; f5: number
  f6: number; f7: number; f8: number; f9: number; f10: number
  score: number
  reasoning: FactorReasoning
}

export interface ScorecardEntry {
  id: string
  uploadId: string
  universe: 'NIFTY100' | 'NIFTY_MIDCAP150'
  runDate: string
  rank: number
  ticker: string
  sector: string
  cmp: number
  f1: number; f2: number; f3: number; f4: number; f5: number
  f6: number; f7: number; f8: number; f9: number; f10: number
  score: number
  recommendation: string
  reasoning: FactorReasoning
  modelScores: ModelScore[]
}

export interface ScorecardUpload {
  id: string
  universe: 'NIFTY100' | 'NIFTY_MIDCAP150'
  runDate: string
  fileName: string
  source: 'MANUAL_XLSX' | 'AI_GENERATED'
  createdAt: string
}

export interface FundamentalsUpload {
  id: string
  universe: 'NIFTY100' | 'NIFTY_MIDCAP150'
  runDate: string
  fileName: string
  rowCount: number
  createdAt: string
}

export interface ScorecardRun {
  id: string
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'
  batchesTotal: number
  batchesDone: number
  resultUploadId: string | null
  error: string | null
  universe: 'NIFTY100' | 'NIFTY_MIDCAP150'
  runDate: string
  createdAt: string
  updatedAt: string
}

export interface ScorecardData {
  uploads: ScorecardUpload[]
  entries: ScorecardEntry[]
}

export function useFactorScorecardData() {
  return useQuery({
    queryKey: ['factor-scorecard'],
    queryFn: async () => {
      const res = await api.get<{ data: ScorecardData }>('/factor-scorecard')
      return res.data.data
    },
  })
}

export function useUploadScorecard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, runDate }: { file: File; runDate: string }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('runDate', runDate)
      const res = await api.post('/factor-scorecard/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factor-scorecard'] }),
  })
}

export function useDeleteScorecardUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (uploadId: string) => {
      await api.delete(`/factor-scorecard/uploads/${uploadId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factor-scorecard'] }),
  })
}

export function useFundamentalsUploads() {
  return useQuery({
    queryKey: ['factor-scorecard-fundamentals'],
    queryFn: async () => {
      const res = await api.get<{ data: FundamentalsUpload[] }>('/factor-scorecard/fundamentals')
      return res.data.data
    },
  })
}

export function useUploadFundamentals() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, runDate }: { file: File; runDate: string }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('runDate', runDate)
      const res = await api.post<{ data: FundamentalsUpload }>('/factor-scorecard/fundamentals/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factor-scorecard-fundamentals'] }),
  })
}

export function useStartScorecardRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fundamentalsUploadId: string) => {
      const res = await api.post<{ data: ScorecardRun }>('/factor-scorecard/run', { fundamentalsUploadId })
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['factor-scorecard-run'] }),
  })
}

export function useScorecardRun(runId: string | null) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['factor-scorecard-run', runId],
    queryFn: async () => {
      const res = await api.get<{ data: ScorecardRun }>(`/factor-scorecard/runs/${runId}`)
      return res.data.data
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'DONE') {
        qc.invalidateQueries({ queryKey: ['factor-scorecard'] })
        return false
      }
      if (status === 'FAILED') return false
      return 2500
    },
  })
}
