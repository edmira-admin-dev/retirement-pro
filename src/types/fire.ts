export interface FireInputs {
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  currentMonthlyExpense: number // ₹
  medicalMonthlyExpense: number // ₹
  lifestyleBuffer: number       // % extra 0–5
  expectedReturnPre: number     // % pa
  expectedReturnPost: number    // % pa
}

export interface FireResult {
  yearsToRetirement: number
  targetCorpus: number
  firstYearExpense: number
  shortfallOrSurplus: number
  monthlySipRequired: number
  healthcareReserve: number
  isFireAchieved: boolean
  effectiveCorpus: number
}

// ─── Extended types ───────────────────────────────────────────────────────────

export interface ExpenseCategory {
  label: string
  monthlyAmount: number  // ₹
  inflationRate: number  // % pa
}

export interface LiabilityItem {
  label: string
  emiMonthly: number          // ₹
  interestRate: number        // % pa
  remainingMonths: number
  outstandingPrincipal: number // ₹
}

export interface AssetAllocation {
  equityPct: number  // 0–100; equityPct + debtPct + goldPct === 100
  debtPct: number
  goldPct: number
}

export interface IncomeInputs {
  currentMonthlySalary: number           // ₹
  salaryGrowthRate: number               // % pa
  monthlyRentalIncome: number            // ₹
  monthlyDividendIncome: number          // ₹
  postRetirementPartTimeMonthly: number  // ₹, assumed until age 70
}

export interface RetirementAssumptions {
  withdrawalRate: number    // % e.g. 3.5 — now editable
  generalInflation: number  // % pa, default 6
  medicalInflation: number  // % pa, default 10
}

export interface NpsInputs {
  npsCorpusToday: number          // ₹
  npsMonthlyContribution: number  // ₹
  npsFundReturnRate: number       // % pa
}

export interface GoalDeduction {
  name: string
  targetYear: number
  inflationAdjustedAmount: number  // ₹
}

export interface ExtendedFireInputs {
  base: FireInputs
  expenses: ExpenseCategory[] | null
  income: IncomeInputs | null
  allocation: AssetAllocation | null
  liabilities: LiabilityItem[] | null
  assumptions: RetirementAssumptions | null
  nps: NpsInputs | null
  goalDeductions: GoalDeduction[] | null
}

export interface SimulationYear {
  age: number
  year: number
  // Accumulation phase
  grossIncome: number
  totalExpenses: number
  totalEmiPayments: number
  investableSurplus: number
  portfolioValue: number
  // Distribution phase
  withdrawalAmount: number
  postRetirementIncome: number
  goalDeductionThisYear: number
}

export interface SensitivityRow {
  label: string
  targetCorpus: number
  survivalAge: number | null
  monthlySip: number
}

export interface ExtendedFireResult extends FireResult {
  simulationYears: SimulationYear[]
  survivalAge: number | null
  requiredMonthlySavings: number
  currentInvestableSurplus: number
  npsLumpsumAt60: number
  npsAnnuityMonthly: number
  section80cUtilization: number
  withdrawalRateSensitivity: SensitivityRow[]
  inflationSensitivity: SensitivityRow[]
}
