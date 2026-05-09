export interface TaxInputs {
  realizedGainsFY: number        // ₹
  unrealizedEquityGains: number  // ₹
}

export interface BucketAllocation {
  bucket1: number  // residual liquid (total - bucket2 - bucket3)
  bucket2: number  // EPF + PPF + NPS
  bucket3: number  // MF + STOCK
  total: number
}

export interface BucketIdeal {
  bucket1: number  // 6 months of firstYearExpense
  bucket2: number  // 20% of effectiveCorpus
  bucket3: number  // remainder
}
