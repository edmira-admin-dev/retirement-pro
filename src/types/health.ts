export interface HealthInputs {
  monthlyIncome: number       // ₹
  monthlyExpenses: number     // ₹
  monthlyEMIs: number         // ₹
  liquidAssets: number        // ₹
  totalLiabilities: number    // ₹
  monthlySavings: number      // ₹
  hasTermInsurance: boolean
  hasHealthInsurance: boolean
  hasWill: boolean
  hasNominations: boolean
}

export interface PillarScore {
  name: string
  score: number
  summary: string
  pass: boolean
}

export interface RatioItem {
  name: string
  value: number
  displayValue: string
  range: string
  pass: boolean
}

export interface HealthResult {
  overallScore: number
  status: 'Healthy' | 'Coping' | 'Vulnerable'
  pillars: PillarScore[]
  ratios: RatioItem[]
  recommendations: string[]
}
