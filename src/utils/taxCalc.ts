import type { Holding } from '../types/holdings'
import type { FireResult } from '../types/fire'
import type { TaxInputs, BucketAllocation, BucketIdeal } from '../types/tax'

export const LTCG_LIMIT = 125_000

export interface LtcgStatus {
  remaining: number
  showAlert: boolean
  isUrgent: boolean  // Feb or March (last 2 months of Indian FY)
  pct: number        // 0–100, how much of limit is used
}

export function computeLtcg(inputs: TaxInputs): LtcgStatus {
  const { realizedGainsFY, unrealizedEquityGains } = inputs
  const remaining = Math.max(0, LTCG_LIMIT - realizedGainsFY)
  const showAlert = realizedGainsFY < LTCG_LIMIT && unrealizedEquityGains > remaining * 0.8
  // 0-indexed calendar: Jan=0, Feb=1, Mar=2
  const month = new Date().getMonth()
  const isUrgent = month === 1 || month === 2
  const pct = Math.min(100, (realizedGainsFY / LTCG_LIMIT) * 100)
  return { remaining, showAlert, isUrgent, pct }
}

export function computeBuckets(holdings: Holding[]): BucketAllocation {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0)
  const bucket2 = holdings
    .filter((h) => h.assetClass === 'EPF' || h.assetClass === 'PPF' || h.assetClass === 'NPS')
    .reduce((s, h) => s + h.currentValue, 0)
  const bucket3 = holdings
    .filter((h) => h.assetClass === 'MF' || h.assetClass === 'STOCK')
    .reduce((s, h) => s + h.currentValue, 0)
  const bucket1 = Math.max(0, total - bucket2 - bucket3)
  return { bucket1, bucket2, bucket3, total }
}

export function computeIdealBuckets(fireResult: FireResult): BucketIdeal {
  const { effectiveCorpus, firstYearExpense } = fireResult
  const bucket1 = firstYearExpense / 2  // 6 months of annual retirement expense
  const bucket2 = effectiveCorpus * 0.2
  const bucket3 = Math.max(0, effectiveCorpus - bucket1 - bucket2)
  return { bucket1, bucket2, bucket3 }
}
