import type { AssetClass } from '../../../types/holdings'

export type PayoutFrequency = 'maturity' | 'quarterly' | 'monthly'

export interface WizardEntry {
  localId: string
  stepKey: string
  name: string
  assetClass: AssetClass
  currentValue: number   // ₹
  investedValue: number  // ₹
  expectedReturn?: number  // % annual
  currency?: string
  loanAmount?: number    // ₹
  // Fixed-income term fields (FD / BOND only)
  startDate?: string           // "MM/YY"
  termMonths?: number          // total tenor in months
  payoutFrequency?: PayoutFrequency
  // Retirement fields (NPS / EPF / PPF / ANNUITY only)
  currentAge?: number          // user's age at time of entry
}

export type WizardStepKey =
  | 'bank' | 'liquid' | 'fixed' | 'equity'
  | 'gold' | 'realestate' | 'retirement' | 'intl' | 'commodities' | 'review'

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
