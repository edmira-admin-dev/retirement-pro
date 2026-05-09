import type { FireInputs, FireResult } from '../types/fire'

export interface ProjectionPoint {
  age: number
  year: number
  conservative: number
  base: number
  optimistic: number
  target: number
}

export type Scenario = 'conservative' | 'base' | 'optimistic'

const SCENARIOS = {
  conservative: { pre: 0.08, post: 0.06 },
  base: { pre: null, post: null }, // filled from user inputs
  optimistic: { pre: 0.15, post: 0.10 },
} as const

const GENERAL_INFLATION = 0.06

function computeCorpusAtAge(
  age: number,
  retirementAge: number,
  _lifeExpectancy: number,
  currentAge: number,
  currentPortfolio: number,
  monthlyExpense: number,
  firstYearExpense: number,
  rPre: number,
  rPost: number,
): number {
  const yearsToRetirement = retirementAge - currentAge

  if (age <= retirementAge) {
    // Accumulation phase
    const t = age - currentAge
    if (rPre === 0) return currentPortfolio
    return (
      currentPortfolio * Math.pow(1 + rPre, t) +
      monthlyExpense * 12 * ((Math.pow(1 + rPre, t) - 1) / rPre)
    )
  }

  // Distribution phase — walk forward from retirement corpus
  const portfolioAtRetirement = (() => {
    const t = yearsToRetirement
    if (rPre === 0) return currentPortfolio
    return (
      currentPortfolio * Math.pow(1 + rPre, t) +
      monthlyExpense * 12 * ((Math.pow(1 + rPre, t) - 1) / rPre)
    )
  })()

  let v = portfolioAtRetirement
  for (let yr = 1; yr <= age - retirementAge; yr++) {
    const withdrawal = firstYearExpense * Math.pow(1 + GENERAL_INFLATION, yr - 1)
    v = v * (1 + rPost) - withdrawal
    if (v < 0) return 0
  }
  return Math.max(v, 0)
}

export function buildProjectionData(
  inputs: FireInputs,
  currentPortfolio: number,
  result: FireResult,
): ProjectionPoint[] {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentMonthlyExpense,
    expectedReturnPre,
    expectedReturnPost,
  } = inputs

  const rPre = expectedReturnPre / 100
  const rPost = expectedReturnPost / 100
  const firstYearExpense = result.firstYearExpense

  const points: ProjectionPoint[] = []

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const year = new Date().getFullYear() + (age - currentAge)

    const conservative = computeCorpusAtAge(
      age, retirementAge, lifeExpectancy, currentAge,
      currentPortfolio, currentMonthlyExpense,
      firstYearExpense,
      SCENARIOS.conservative.pre, SCENARIOS.conservative.post,
    )

    const base = computeCorpusAtAge(
      age, retirementAge, lifeExpectancy, currentAge,
      currentPortfolio, currentMonthlyExpense,
      firstYearExpense,
      rPre, rPost,
    )

    const optimistic = computeCorpusAtAge(
      age, retirementAge, lifeExpectancy, currentAge,
      currentPortfolio, currentMonthlyExpense,
      firstYearExpense,
      SCENARIOS.optimistic.pre, SCENARIOS.optimistic.post,
    )

    points.push({
      age,
      year,
      conservative,
      base,
      optimistic,
      target: result.effectiveCorpus,
    })
  }

  return points
}

export function findDepletionAge(points: ProjectionPoint[], scenario: Scenario): number | null {
  for (const p of points) {
    if (p[scenario] === 0) return p.age
  }
  return null
}
