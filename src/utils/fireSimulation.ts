import type {
  ExtendedFireInputs,
  ExtendedFireResult,
  LiabilityItem,
  NpsInputs,
  SimulationYear,
  SensitivityRow,
  RetirementAssumptions,
} from '../types/fire'
import { computeFireResult } from './fireCalc'

const NPS_ANNUITY_RATE = 0.06       // 6% annuity yield on the 40% NPS corpus
const NPS_LUMPSUM_FRACTION = 0.60
const NPS_ANNUITY_FRACTION = 0.40
const SECTION_80C_LIMIT = 150_000   // ₹1.5L

// ─── Liability schedule ───────────────────────────────────────────────────────

export function buildLiabilitySchedule(
  liabilities: LiabilityItem[],
  horizonYears: number,
): Map<number, number> {
  const schedule = new Map<number, number>()
  for (let y = 0; y < horizonYears; y++) {
    let total = 0
    for (const l of liabilities) {
      const monthsElapsed = y * 12
      if (monthsElapsed < l.remainingMonths) {
        total += l.emiMonthly * 12
      }
    }
    schedule.set(y, total)
  }
  return schedule
}

// ─── NPS projection ───────────────────────────────────────────────────────────

export function projectNps(
  nps: NpsInputs,
  currentAge: number,
): { lumpsumAt60: number; monthlyAnnuity: number } {
  if (currentAge >= 60) {
    return { lumpsumAt60: nps.npsCorpusToday, monthlyAnnuity: 0 }
  }
  const yearsTo60 = 60 - currentAge
  const r = nps.npsFundReturnRate / 100
  const monthlyR = Math.pow(1 + r, 1 / 12) - 1
  const n = yearsTo60 * 12

  const growthOfExisting = nps.npsCorpusToday * Math.pow(1 + r, yearsTo60)
  const sipFv =
    monthlyR > 0
      ? nps.npsMonthlyContribution * ((Math.pow(1 + monthlyR, n) - 1) / monthlyR)
      : nps.npsMonthlyContribution * n

  const totalAt60 = growthOfExisting + sipFv
  const lumpsumAt60 = totalAt60 * NPS_LUMPSUM_FRACTION
  const annuityCorpus = totalAt60 * NPS_ANNUITY_FRACTION
  // Monthly annuity approximation
  const monthlyAnnuity = (annuityCorpus * NPS_ANNUITY_RATE) / 12

  return { lumpsumAt60, monthlyAnnuity }
}

// ─── Single-run simulation ────────────────────────────────────────────────────

function simulateOnce(
  extended: ExtendedFireInputs,
  currentPortfolio: number,
  overrideAssumptions?: Partial<RetirementAssumptions>,
): ExtendedFireResult {
  const { base, expenses, income, liabilities, nps, goalDeductions } = extended
  const assumptions: RetirementAssumptions = {
    withdrawalRate: extended.assumptions?.withdrawalRate ?? 3.5,
    generalInflation: extended.assumptions?.generalInflation ?? 6,
    medicalInflation: extended.assumptions?.medicalInflation ?? 10,
    ...overrideAssumptions,
  }

  const currentYear = new Date().getFullYear()
  const horizonYears = Math.max(base.lifeExpectancy - base.currentAge, 0)

  // Liability schedule
  const liabilitySchedule = buildLiabilitySchedule(liabilities ?? [], horizonYears)

  // NPS
  const npsResult = nps ? projectNps(nps, base.currentAge) : { lumpsumAt60: 0, monthlyAnnuity: 0 }

  // Section 80C
  const annualNpsContrib = nps ? nps.npsMonthlyContribution * 12 : 0
  const section80cUtilization = Math.min(annualNpsContrib, SECTION_80C_LIMIT)

  // Compute current investable surplus (year 0)
  let currentInvestableSurplus = 0
  if (income) {
    const annualIncome =
      income.currentMonthlySalary * 12 +
      income.monthlyRentalIncome * 12 +
      income.monthlyDividendIncome * 12
    const annualExpenses = expenses
      ? expenses.reduce((s, e) => s + e.monthlyAmount * 12, 0)
      : (base.currentMonthlyExpense + base.medicalMonthlyExpense) * 12
    const annualEmi = liabilitySchedule.get(0) ?? 0
    currentInvestableSurplus = Math.max(annualIncome - annualExpenses - annualEmi, 0)
  }

  // Compute target corpus using SWR approach
  const yearsToRetirement = Math.max(base.retirementAge - base.currentAge, 0)
  const retirementYears = Math.max(base.lifeExpectancy - base.retirementAge, 0)
  const genInfl = assumptions.generalInflation / 100
  const medInfl = assumptions.medicalInflation / 100
  const swr = assumptions.withdrawalRate / 100

  const fvGeneral =
    base.currentMonthlyExpense * 12 * Math.pow(1 + genInfl, yearsToRetirement)
  const fvMedical =
    base.medicalMonthlyExpense * 12 * Math.pow(1 + medInfl, yearsToRetirement)
  const firstYearExpense =
    fvGeneral + fvMedical * (1 + base.lifestyleBuffer / 100)

  // SWR-based target corpus (replaces PV annuity when withdrawalRate is user-specified)
  const targetCorpus = swr > 0 ? firstYearExpense / swr : firstYearExpense * retirementYears

  // LTCG-adjusted effective corpus (same as fireCalc)
  const LTCG_RATE = 0.125
  const LTCG_EQUITY_PCT = 0.30
  const effectiveCorpus = targetCorpus / (1 - LTCG_RATE * LTCG_EQUITY_PCT)

  // Year-by-year simulation loop
  const simulationYears: SimulationYear[] = []
  let portfolio = currentPortfolio
  let survivalAge: number | null = null
  let npsDone = false

  for (let y = 0; y < horizonYears; y++) {
    const age = base.currentAge + y
    const calYear = currentYear + y
    const isRetired = age >= base.retirementAge
    const emiThisYear = liabilitySchedule.get(y) ?? 0
    const goalDedThisYear = (goalDeductions ?? [])
      .filter(g => g.targetYear === calYear)
      .reduce((s, g) => s + g.inflationAdjustedAmount, 0)

    if (!isRetired) {
      // Accumulation phase
      let grossIncome = 0
      let totalExpenses = 0

      if (income) {
        const growthFactor = Math.pow(1 + income.salaryGrowthRate / 100, y)
        grossIncome =
          income.currentMonthlySalary * 12 * growthFactor +
          income.monthlyRentalIncome * 12 +
          income.monthlyDividendIncome * 12
      }

      if (expenses) {
        for (const cat of expenses) {
          totalExpenses +=
            cat.monthlyAmount * 12 * Math.pow(1 + cat.inflationRate / 100, y)
        }
      } else {
        totalExpenses =
          base.currentMonthlyExpense * 12 * Math.pow(1 + genInfl, y) +
          base.medicalMonthlyExpense * 12 * Math.pow(1 + medInfl, y)
      }

      const invSurplus = Math.max(grossIncome - totalExpenses - emiThisYear, 0)
      portfolio = portfolio * (1 + base.expectedReturnPre / 100) + invSurplus - goalDedThisYear
      portfolio = Math.max(portfolio, 0)

      simulationYears.push({
        age,
        year: calYear,
        grossIncome,
        totalExpenses,
        totalEmiPayments: emiThisYear,
        investableSurplus: invSurplus,
        portfolioValue: portfolio,
        withdrawalAmount: 0,
        postRetirementIncome: 0,
        goalDeductionThisYear: goalDedThisYear,
      })
    } else {
      // Distribution phase
      const postInfl = genInfl
      const yearsIntoRetirement = age - base.retirementAge
      const withdrawalAmount = firstYearExpense * Math.pow(1 + postInfl, yearsIntoRetirement)

      let postRetirementIncome = 0
      if (income) {
        const partTimeEnd = 70
        if (age < partTimeEnd) {
          postRetirementIncome += income.postRetirementPartTimeMonthly * 12
        }
        postRetirementIncome +=
          income.monthlyRentalIncome * 12 + income.monthlyDividendIncome * 12
      }

      // NPS lumpsum at age 60
      if (nps && age === 60 && !npsDone) {
        portfolio += npsResult.lumpsumAt60
        npsDone = true
      }

      // NPS annuity (monthly → annual)
      if (nps && age >= 60) {
        postRetirementIncome += npsResult.monthlyAnnuity * 12
      }

      const netWithdrawal = Math.max(withdrawalAmount - postRetirementIncome, 0)
      portfolio = portfolio * (1 + base.expectedReturnPost / 100) - netWithdrawal - goalDedThisYear
      portfolio = Math.max(portfolio, 0)

      if (portfolio === 0 && survivalAge === null) {
        survivalAge = age
      }

      simulationYears.push({
        age,
        year: calYear,
        grossIncome: postRetirementIncome,
        totalExpenses: withdrawalAmount,
        totalEmiPayments: 0,
        investableSurplus: 0,
        portfolioValue: portfolio,
        withdrawalAmount,
        postRetirementIncome,
        goalDeductionThisYear: goalDedThisYear,
      })
    }
  }

  const shortfallOrSurplus = currentPortfolio - effectiveCorpus
  const isFireAchieved = currentPortfolio >= effectiveCorpus

  // Required monthly SIP
  let monthlySipRequired = 0
  if (!isFireAchieved && yearsToRetirement > 0) {
    const n = yearsToRetirement * 12
    const r = Math.pow(1 + base.expectedReturnPre / 100, 1 / 12) - 1
    const gap = effectiveCorpus - currentPortfolio
    monthlySipRequired = r > 0 ? (gap * r) / (Math.pow(1 + r, n) - 1) : gap / n
  }

  return {
    // Legacy FireResult fields
    yearsToRetirement,
    targetCorpus,
    firstYearExpense,
    shortfallOrSurplus,
    monthlySipRequired,
    healthcareReserve: 6_000_000,
    isFireAchieved,
    effectiveCorpus,
    // Extended fields
    simulationYears,
    survivalAge,
    requiredMonthlySavings: monthlySipRequired,
    currentInvestableSurplus,
    npsLumpsumAt60: npsResult.lumpsumAt60,
    npsAnnuityMonthly: npsResult.monthlyAnnuity,
    section80cUtilization,
    withdrawalRateSensitivity: [],
    inflationSensitivity: [],
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function runFireSimulation(
  extended: ExtendedFireInputs,
  currentPortfolio: number,
): ExtendedFireResult {
  const isLegacyMode =
    extended.expenses === null &&
    extended.income === null &&
    extended.liabilities === null

  if (isLegacyMode) {
    const legacy = computeFireResult(extended.base, currentPortfolio)
    return {
      ...legacy,
      simulationYears: [],
      survivalAge: null,
      requiredMonthlySavings: legacy.monthlySipRequired,
      currentInvestableSurplus: 0,
      npsLumpsumAt60: 0,
      npsAnnuityMonthly: 0,
      section80cUtilization: 0,
      withdrawalRateSensitivity: [],
      inflationSensitivity: [],
    }
  }

  const base = simulateOnce(extended, currentPortfolio)
  const withdrawalRateSensitivity = buildWithdrawalSensitivity(extended, currentPortfolio)
  const inflationSensitivity = buildInflationSensitivity(extended, currentPortfolio)

  return { ...base, withdrawalRateSensitivity, inflationSensitivity }
}

// ─── Sensitivity helpers ──────────────────────────────────────────────────────

function sensitivityRow(
  extended: ExtendedFireInputs,
  portfolio: number,
  override: Partial<RetirementAssumptions>,
  label: string,
): SensitivityRow {
  const result = simulateOnce(extended, portfolio, override)
  return {
    label,
    targetCorpus: result.targetCorpus,
    survivalAge: result.survivalAge,
    monthlySip: result.monthlySipRequired,
  }
}

export function buildWithdrawalSensitivity(
  extended: ExtendedFireInputs,
  portfolio: number,
): SensitivityRow[] {
  return [2.5, 3.0, 3.5, 4.0, 4.5].map(rate =>
    sensitivityRow(extended, portfolio, { withdrawalRate: rate }, `${rate}% SWR`),
  )
}

export function buildInflationSensitivity(
  extended: ExtendedFireInputs,
  portfolio: number,
): SensitivityRow[] {
  return [5, 6, 7, 8].map(rate =>
    sensitivityRow(extended, portfolio, { generalInflation: rate }, `${rate}% inflation`),
  )
}
