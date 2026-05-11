export type IncomeCategory =
  | 'SALARY'
  | 'FREELANCE'
  | 'RENTAL'
  | 'DIVIDEND'
  | 'BUSINESS'
  | 'INTEREST'
  | 'OTHER'

export type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME'

export interface IncomeRecord {
  id: string
  source: string
  amountPaise: number
  category: IncomeCategory
  date: string
  recurring: boolean
  frequency: RecurringFrequency
  notes: string | null
  createdAt: string
}

export interface IncomeSummary {
  byCategory: { category: IncomeCategory; totalPaise: number }[]
  monthlyTotal: number
  ytdTotal: number
}
