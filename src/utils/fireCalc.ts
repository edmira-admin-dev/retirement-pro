import type { FireInputs, FireResult } from '../types/fire'

const LTCG_RATE = 0.125
const LTCG_EQUITY_PCT = 0.30
const HEALTHCARE_RESERVE = 6_000_000 // ₹60L
const GENERAL_INFLATION = 0.06
const MEDICAL_INFLATION = 0.12

export function computeFireResult(inputs: FireInputs, currentPortfolio: number): FireResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentMonthlyExpense,
    medicalMonthlyExpense,
    lifestyleBuffer,
    expectedReturnPost,
    expectedReturnPre,
  } = inputs

  const yearsToRetirement = Math.max(retirementAge - currentAge, 0)
  const retirementYears = Math.max(lifeExpectancy - retirementAge, 0)

  // Future value of expenses at retirement
  const fvGeneral =
    currentMonthlyExpense * 12 * Math.pow(1 + GENERAL_INFLATION, yearsToRetirement)
  const fvMedical =
    medicalMonthlyExpense * 12 * Math.pow(1 + MEDICAL_INFLATION, yearsToRetirement)
  const firstYearExpense = fvGeneral + fvMedical * (1 + lifestyleBuffer / 100)

  // Real return (post-retirement, inflation-adjusted)
  const realReturn = (1 + expectedReturnPost / 100) / (1 + GENERAL_INFLATION) - 1

  // Target corpus — PV of retirement withdrawal annuity
  let targetCorpus: number
  if (retirementYears <= 0) {
    targetCorpus = 0
  } else if (Math.abs(realReturn) < 0.0001) {
    targetCorpus = firstYearExpense * retirementYears
  } else {
    targetCorpus =
      (firstYearExpense * (1 - Math.pow(1 + realReturn, -retirementYears))) / realReturn
  }

  // Adjust for LTCG tax drag on equity exit
  const effectiveCorpus = targetCorpus / (1 - LTCG_RATE * LTCG_EQUITY_PCT)

  const shortfallOrSurplus = currentPortfolio - effectiveCorpus
  const isFireAchieved = currentPortfolio >= effectiveCorpus

  // Monthly SIP required to reach target
  let monthlySipRequired = 0
  if (!isFireAchieved && yearsToRetirement > 0) {
    const n = yearsToRetirement * 12
    const r = Math.pow(1 + expectedReturnPre / 100, 1 / 12) - 1
    const gap = effectiveCorpus - currentPortfolio
    monthlySipRequired =
      r > 0
        ? (gap * r) / (Math.pow(1 + r, n) - 1)
        : gap / n
  }

  return {
    yearsToRetirement,
    targetCorpus,
    firstYearExpense,
    shortfallOrSurplus,
    monthlySipRequired,
    healthcareReserve: HEALTHCARE_RESERVE,
    isFireAchieved,
    effectiveCorpus,
  }
}
