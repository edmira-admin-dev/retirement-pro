import type { HealthInputs, HealthResult, PillarScore, RatioItem } from '../types/health'

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function lerp(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin)
}

function liquidityScore(inputs: HealthInputs): PillarScore {
  const { liquidAssets, monthlyExpenses } = inputs
  const ratio = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0
  let score: number
  if (ratio >= 3) score = 100
  else if (ratio >= 1) score = clamp(lerp(ratio, 1, 3, 40, 100), 40, 100)
  else score = clamp(lerp(ratio, 0, 1, 0, 40), 0, 40)

  return {
    name: 'Liquidity',
    score: Math.round(score),
    pass: ratio >= 3,
    summary: `${ratio.toFixed(1)}x monthly expenses in liquid assets (target: 3–6x)`,
  }
}

function budgetingScore(inputs: HealthInputs): PillarScore {
  const { monthlyIncome, monthlyExpenses } = inputs
  const ratio = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0
  const pct = ratio * 100
  let score: number
  if (pct >= 25) score = 100
  else if (pct >= 10) score = clamp(lerp(pct, 10, 25, 60, 100), 60, 100)
  else if (pct >= 0) score = clamp(lerp(pct, 0, 10, 20, 60), 20, 60)
  else score = 0

  return {
    name: 'Budgeting',
    score: Math.round(score),
    pass: pct >= 25,
    summary: `${pct.toFixed(1)}% of income saved after expenses (target: >25%)`,
  }
}

function savingsEfficiencyScore(inputs: HealthInputs): PillarScore {
  const { monthlyIncome, monthlyExpenses, monthlySavings } = inputs
  const surplus = monthlyIncome - monthlyExpenses
  const ratio = surplus > 0 ? (monthlySavings / surplus) * 100 : 0
  let score: number
  if (ratio >= 75) score = 100
  else if (ratio >= 25) score = clamp(lerp(ratio, 25, 75, 60, 100), 60, 100)
  else if (ratio >= 0) score = clamp(lerp(ratio, 0, 25, 20, 60), 20, 60)
  else score = 0

  return {
    name: 'Savings Efficiency',
    score: Math.round(score),
    pass: ratio >= 75,
    summary: `${ratio.toFixed(1)}% of surplus invested (target: >75%)`,
  }
}

function debtScore(inputs: HealthInputs): PillarScore {
  const { monthlyEMIs, monthlyIncome } = inputs
  const ratio = monthlyIncome > 0 ? (monthlyEMIs / monthlyIncome) * 100 : 0
  let score: number
  if (ratio <= 35) score = 100
  else if (ratio <= 40) score = clamp(lerp(ratio, 35, 40, 60, 100), 60, 100)
  else if (ratio <= 50) score = clamp(lerp(ratio, 40, 50, 20, 60), 20, 60)
  else score = 0

  return {
    name: 'Debt Management',
    score: Math.round(score),
    pass: ratio <= 35,
    summary: `EMIs are ${ratio.toFixed(1)}% of income (target: <35%)`,
  }
}

function solvencyScore(inputs: HealthInputs, totalAssets: number): PillarScore {
  const { totalLiabilities } = inputs
  const netWorth = totalAssets - totalLiabilities
  const ratio = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0
  let score: number
  if (ratio >= 20) score = 100
  else if (ratio >= 0) score = clamp(lerp(ratio, 0, 20, 40, 100), 40, 100)
  else score = 0

  return {
    name: 'Solvency',
    score: Math.round(score),
    pass: ratio >= 20,
    summary: `Net worth is ${ratio.toFixed(1)}% of total assets (target: >20%)`,
  }
}

function protectionScore(inputs: HealthInputs): PillarScore {
  const { hasTermInsurance, hasHealthInsurance, hasWill, hasNominations } = inputs
  const checks = [hasTermInsurance, hasHealthInsurance, hasWill, hasNominations]
  const count = checks.filter(Boolean).length
  const score = count * 25

  return {
    name: 'Protection',
    score,
    pass: count === 4,
    summary: `${count}/4 protection checks complete (term, health, will, nominations)`,
  }
}

function buildRatios(inputs: HealthInputs, totalAssets: number): RatioItem[] {
  const { monthlyIncome, monthlyExpenses, monthlyEMIs, liquidAssets, totalLiabilities, monthlySavings } = inputs

  const liquidRatio = monthlyExpenses > 0 ? liquidAssets / monthlyExpenses : 0
  const savingsRatePct = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
  const surplus = monthlyIncome - monthlyExpenses
  const savingsEffPct = surplus > 0 ? (monthlySavings / surplus) * 100 : 0
  const dtiPct = monthlyIncome > 0 ? (monthlyEMIs / monthlyIncome) * 100 : 0
  const netWorthRatioPct = totalAssets > 0 ? ((totalAssets - totalLiabilities) / totalAssets) * 100 : 0

  return [
    {
      name: 'Emergency Fund',
      value: liquidRatio,
      displayValue: `${liquidRatio.toFixed(1)}x`,
      range: '3–6 months',
      pass: liquidRatio >= 3,
    },
    {
      name: 'Savings Rate',
      value: savingsRatePct,
      displayValue: `${savingsRatePct.toFixed(1)}%`,
      range: '>25%',
      pass: savingsRatePct >= 25,
    },
    {
      name: 'Savings Efficiency',
      value: savingsEffPct,
      displayValue: `${savingsEffPct.toFixed(1)}%`,
      range: '>75% of surplus',
      pass: savingsEffPct >= 75,
    },
    {
      name: 'Debt-to-Income (DTI)',
      value: dtiPct,
      displayValue: `${dtiPct.toFixed(1)}%`,
      range: '<35%',
      pass: dtiPct <= 35,
    },
    {
      name: 'Solvency Ratio',
      value: netWorthRatioPct,
      displayValue: `${netWorthRatioPct.toFixed(1)}%`,
      range: '>20%',
      pass: netWorthRatioPct >= 20,
    },
  ]
}

function buildRecommendations(inputs: HealthInputs, _pillars: PillarScore[], ratios: RatioItem[]): string[] {
  const recs: string[] = []
  const { monthlyEMIs, monthlyIncome, hasTermInsurance, hasHealthInsurance, hasWill, hasNominations } = inputs
  const dtiPct = monthlyIncome > 0 ? (monthlyEMIs / monthlyIncome) * 100 : 0

  if (!ratios[0].pass) recs.push('Build an emergency fund to cover 3–6 months of expenses before investing further')
  if (dtiPct > 40) recs.push('Prepay high-interest loans before increasing SIPs — EMIs exceed 40% of income')
  else if (!ratios[3].pass) recs.push('Reduce EMIs to below 35% of income by prepaying high-interest debt')
  if (!ratios[1].pass) recs.push('Cut monthly expenses to push your savings rate above 25% of income')
  if (!ratios[2].pass) recs.push('Redirect at least 75% of surplus income into systematic investments')
  if (!ratios[4].pass) recs.push('Focus on reducing liabilities to improve your solvency ratio above 20%')
  if (!hasTermInsurance) recs.push('Get term life cover of at least 15× your annual income')
  if (!hasHealthInsurance) recs.push('Get health insurance covering at least ₹10L per family member')
  if (!hasWill) recs.push('Draft a will to protect your family\'s financial future')
  if (!hasNominations) recs.push('Add nominees to all financial accounts, mutual funds, and insurance policies')

  return recs
}

export function computeHealthResult(inputs: HealthInputs, totalAssets: number): HealthResult {
  const pillars: PillarScore[] = [
    liquidityScore(inputs),
    budgetingScore(inputs),
    savingsEfficiencyScore(inputs),
    debtScore(inputs),
    solvencyScore(inputs, totalAssets),
    protectionScore(inputs),
  ]

  const overallScore = Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length)
  const status: HealthResult['status'] =
    overallScore >= 70 ? 'Healthy' : overallScore >= 40 ? 'Coping' : 'Vulnerable'

  const ratios = buildRatios(inputs, totalAssets)
  const recommendations = buildRecommendations(inputs, pillars, ratios)

  return { overallScore, status, pillars, ratios, recommendations }
}
