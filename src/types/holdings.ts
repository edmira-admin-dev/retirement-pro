export type AssetClass =
  | 'MF' | 'NPS' | 'EPF' | 'PPF' | 'STOCK'
  | 'BANK' | 'LIQUID' | 'FD' | 'BOND' | 'ETF'
  | 'GOLD' | 'REAL_ESTATE' | 'ANNUITY' | 'INTL_EQUITY' | 'INTL_DEBT'
  | 'COMMODITY'

export interface Holding {
  id: string
  name: string
  assetClass: AssetClass
  currentValue: number   // ₹ (converted from paise)
  investedValue: number  // ₹
  units?: number
  nav?: number
  notes?: string
  lastUpdated: string
}

export type HoldingInput = Omit<Holding, 'id' | 'lastUpdated'>
