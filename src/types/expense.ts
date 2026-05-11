export type ExpenseType = 'FIXED' | 'DISCRETIONARY' | 'LOAN'

export type FixedCategory =
  | 'RENT' | 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET'
  | 'GROCERY' | 'COOK' | 'DRIVER' | 'MAID' | 'INSURANCE'
  | 'SUBSCRIPTIONS' | 'FIXED_OTHER'

export type DiscretionaryCategory =
  | 'FOOD' | 'TRANSPORT' | 'HEALTHCARE' | 'ENTERTAINMENT'
  | 'SHOPPING' | 'EDUCATION' | 'TRAVEL' | 'INVESTMENT'
  | 'DISC_OTHER'

export type LoanCategory =
  | 'HOME_LOAN_EMI' | 'CAR_LOAN_EMI' | 'PERSONAL_LOAN_EMI'
  | 'EDUCATION_LOAN_EMI' | 'CREDIT_CARD_EMI' | 'LOAN_OTHER'

export type ExpenseCategory = FixedCategory | DiscretionaryCategory | LoanCategory

export interface ExpenseRecord {
  id: string
  userId: string
  merchant: string
  amountPaise: number
  expenseType: ExpenseType
  category: ExpenseCategory
  date: string
  recurring: boolean
  notes: string | null
  importedFrom: 'MANUAL' | 'CSV' | null
  createdAt: string
}

export interface ExpenseSummary {
  byType: { FIXED: number; DISCRETIONARY: number; LOAN: number }
  byCategory: Partial<Record<ExpenseCategory, number>>
}
