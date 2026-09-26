import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export interface ParsedTrade {
  symbol: string; isin: string; tradeDate: string; exchange: string
  segment: string; tradeType: string; quantity: number; price: number
  tradeId: string; orderId: string; executionTime: string; isDuplicate?: boolean
}

export interface ParsedDividend {
  symbol: string; isin: string; exDate: string; quantity: number
  dividendPerShare: number; netAmount: number; isDuplicate?: boolean
}

export interface ParsedCharge {
  periodFrom: string; periodTo: string; accountHead: string; amount: number; isDuplicate?: boolean
}

export interface ParsedHolding {
  symbol: string; isin: string; sector: string
  quantityAvailable: number; quantityLongTerm: number
  avgPrice: number; currentPrice: number
  unrealizedPnl: number; unrealizedPnlPct: number
  asOfDate: string; isDuplicate?: boolean
}

export interface ParsedRealizedPnl {
  symbol: string; isin: string; entryDate: string; exitDate: string
  quantity: number; buyValue: number; sellValue: number; profit: number
  holdingType: 'STCG' | 'LTCG' | 'INTRADAY'; taxableProfit: number
  periodFrom: string; periodTo: string
  charges?: number  // sum of per-trade charges (STT, brokerage, SEBI, etc.)
  isDuplicate?: boolean
}

export interface ParseResult {
  uploadType: 'TRADEBOOK_CSV' | 'AGTS_XLSX' | 'DIVIDEND_XLSX' | 'HOLDINGS_XLSX' | 'TAXPNL_XLSX' | 'HDFC_SKY_PNL' | 'ANGEL_ONE_PNL' | 'GROWW_CAPITAL_GAINS' | 'GROWW_DIVIDEND_PDF' | 'YES_BANK_PNL'
  fileName: string; periodFrom?: string; periodTo?: string
  trades: ParsedTrade[]; dividends: ParsedDividend[]; charges: ParsedCharge[]
  holdings: ParsedHolding[]; realizedPnl: ParsedRealizedPnl[]
  newCount: number; duplicateCount: number
}

export interface MergedPreview {
  trades: ParsedTrade[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
  realizedPnl: ParsedRealizedPnl[]
  newCount: number
  duplicateCount: number
  fileNames: string[]
}

export interface BatchSavePayload {
  fileNames: string[]
  trades: ParsedTrade[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
  realizedPnl: ParsedRealizedPnl[]
}

export interface StockHolding {
  id: string; symbol: string; isin: string; sector: string
  quantityAvailable: number; quantityLongTerm: number
  avgPrice: number; currentPrice: number
  unrealizedPnl: number; unrealizedPnlPct: number
  asOfDate: string
}

export interface RealizedPnlRecord {
  id: string; symbol: string; isin: string; entryDate: string; exitDate: string
  quantity: number; buyValue: number; sellValue: number; profit: number
  holdingType: 'STCG' | 'LTCG' | 'INTRADAY'; taxableProfit: number
  periodFrom: string; periodTo: string
}

export interface DividendSummary {
  total: number
  records: Array<{ id: string; symbol: string; isin: string; exDate: string; quantity: number; dividendPerShare: number; netAmount: number }>
}

async function parseOne (file: File): Promise<ParseResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<{ data: ParseResult }>('/tradebook/parse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export function mergeParseResults (results: ParseResult[]): MergedPreview {
  const seenTradeIds = new Set<string>()
  const seenDivKeys = new Set<string>()
  const seenChargeKeys = new Set<string>()
  const seenHoldingKeys = new Set<string>()
  const seenPnlKeys = new Set<string>()

  const trades: ParsedTrade[] = []
  const dividends: ParsedDividend[] = []
  const charges: ParsedCharge[] = []
  const holdings: ParsedHolding[] = []
  const realizedPnl: ParsedRealizedPnl[] = []

  for (const r of results) {
    for (const t of r.trades) {
      if (seenTradeIds.has(t.tradeId)) continue
      seenTradeIds.add(t.tradeId)
      trades.push(t)
    }
    for (const d of r.dividends) {
      const key = `${d.isin}|${d.exDate}`
      if (seenDivKeys.has(key)) continue
      seenDivKeys.add(key)
      dividends.push(d)
    }
    for (const c of r.charges) {
      const key = `${c.periodFrom}|${c.periodTo}|${c.accountHead}`
      if (seenChargeKeys.has(key)) continue
      seenChargeKeys.add(key)
      charges.push(c)
    }
    for (const h of (r.holdings ?? [])) {
      const key = `${h.symbol}|${h.isin}|${h.asOfDate}`
      if (seenHoldingKeys.has(key)) continue
      seenHoldingKeys.add(key)
      holdings.push(h)
    }
    for (const p of (r.realizedPnl ?? [])) {
      const key = `${p.symbol}|${p.isin}|${p.entryDate}|${p.exitDate}|${p.holdingType}|${p.quantity}`
      if (seenPnlKeys.has(key)) continue
      seenPnlKeys.add(key)
      realizedPnl.push(p)
    }
  }

  trades.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate) || a.executionTime.localeCompare(b.executionTime))
  dividends.sort((a, b) => a.exDate.localeCompare(b.exDate))
  charges.sort((a, b) => a.periodFrom.localeCompare(b.periodFrom) || a.accountHead.localeCompare(b.accountHead))
  holdings.sort((a, b) => a.sector.localeCompare(b.sector) || a.symbol.localeCompare(b.symbol))
  realizedPnl.sort((a, b) => b.exitDate.localeCompare(a.exitDate))

  const all = [...trades, ...dividends, ...charges, ...holdings, ...realizedPnl]
  return {
    trades, dividends, charges, holdings, realizedPnl,
    newCount: all.filter(r => !r.isDuplicate).length,
    duplicateCount: all.filter(r => r.isDuplicate).length,
    fileNames: results.map(r => r.fileName),
  }
}

export function useParseFiles () {
  return useMutation<ParseResult[], Error, File[]>({
    mutationFn: (files: File[]) => Promise.all(files.map(parseOne)),
  })
}

export function useSaveBatch () {
  const qc = useQueryClient()
  return useMutation<{ created: number; updated: number }, Error, BatchSavePayload>({
    mutationFn: async (payload) => {
      const res = await api.post<{ data: { created: number; updated: number } }>('/tradebook/save-batch', payload)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tradebook'] })
    },
  })
}

export function useTrades () {
  return useQuery<ParsedTrade[]>({
    queryKey: ['tradebook', 'trades'],
    queryFn: async () => {
      const res = await api.get<{ data: ParsedTrade[] }>('/tradebook/trades')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useDividends () {
  return useQuery<ParsedDividend[]>({
    queryKey: ['tradebook', 'dividends'],
    queryFn: async () => {
      const res = await api.get<{ data: ParsedDividend[] }>('/tradebook/dividends')
      return res.data.data
    },
    enabled: false,
    staleTime: Infinity,
  })
}

export function useCharges () {
  return useQuery<ParsedCharge[]>({
    queryKey: ['tradebook', 'charges'],
    queryFn: async () => {
      const res = await api.get<{ data: ParsedCharge[] }>('/tradebook/charges')
      return res.data.data
    },
    enabled: false,
    staleTime: Infinity,
  })
}

export function useStockHoldings () {
  return useQuery<StockHolding[]>({
    queryKey: ['tradebook', 'holdings'],
    queryFn: async () => {
      const res = await api.get<{ data: StockHolding[] }>('/tradebook/holdings')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useRealizedPnl () {
  return useQuery<RealizedPnlRecord[]>({
    queryKey: ['tradebook', 'realized-pnl'],
    queryFn: async () => {
      const res = await api.get<{ data: RealizedPnlRecord[] }>('/tradebook/realized-pnl')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export interface TaxPnlSavePayload {
  broker: string
  realizedPnl: ParsedRealizedPnl[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
}

export interface TableResult { created: number; updated: number; skipped: number }
export interface TaxPnlSaveResult {
  realizedPnl: TableResult
  dividends: TableResult
  charges: TableResult
  holdings: TableResult
}

export function useSaveTaxPnl () {
  const qc = useQueryClient()
  return useMutation<TaxPnlSaveResult, Error, TaxPnlSavePayload>({
    mutationFn: async (payload) => {
      const res = await api.post<{ data: TaxPnlSaveResult }>('/taxpnl/save', payload)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxpnl'] })
    },
  })
}

export interface TaxPnlDbData {
  realizedPnl: Array<{
    id: string; symbol: string; isin: string; entryDate: string; exitDate: string
    quantity: number; buyValue: number; sellValue: number; profit: number
    holdingType: string; taxableProfit: number; periodFrom: string; periodTo: string
    tradeCharges: number
  }>
  dividends: Array<{
    id: string; symbol: string; isin: string; exDate: string
    quantity: number; dividendPerShare: number; netAmount: number
  }>
  charges: Array<{
    id: string; periodFrom: string; periodTo: string; accountHead: string; amount: number
  }>
  holdings: Array<{
    id: string; symbol: string; isin: string; sector: string
    quantityAvailable: number; quantityLongTerm: number
    avgPrice: number; currentPrice: number
    unrealizedPnl: number; unrealizedPnlPct: number; asOfDate: string
  }>
}

export function useTaxPnlData (broker: string) {
  return useQuery<TaxPnlDbData>({
    queryKey: ['taxpnl', 'data', broker],
    queryFn: async () => {
      const res = await api.get<{ data: TaxPnlDbData }>(`/taxpnl/data?broker=${broker.toUpperCase()}`)
      return res.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export interface DeleteResult { realizedPnl: number; dividends: number; charges: number; holdings: number }

export function useDeleteTaxPnl () {
  const qc = useQueryClient()
  return useMutation<DeleteResult, Error, string>({
    mutationFn: async (broker) => {
      const res = await api.delete<{ data: DeleteResult }>(`/taxpnl/data?broker=${broker.toUpperCase()}`)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taxpnl'] })
      qc.invalidateQueries({ queryKey: ['tradebook'] })
    },
  })
}

export function useDividendSummary () {
  return useQuery<DividendSummary>({
    queryKey: ['tradebook', 'dividend-summary'],
    queryFn: async () => {
      const res = await api.get<{ data: DividendSummary }>('/tradebook/dividend-summary')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
