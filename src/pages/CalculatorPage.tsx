import { useState, useEffect, useMemo } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { InputPanel } from '../components/calculator/InputPanel'
import { ResultPanel } from '../components/calculator/ResultPanel'
import { InflationBreakdown } from '../components/calculator/InflationBreakdown'
import { ProjectionChart } from '../components/calculator/ProjectionChart'
import { CashflowChart } from '../components/calculator/CashflowChart'
import { NetWorthTable } from '../components/calculator/NetWorthTable'
import { SensitivityPanel } from '../components/calculator/SensitivityPanel'
import { useFireProfile } from '../hooks/useFireProfile'
import { useHoldings } from '../hooks/useHoldings'
import { useGoals } from '../hooks/useGoals'
import { runFireSimulation } from '../utils/fireSimulation'
import type { ExtendedFireInputs, GoalDeduction } from '../types/fire'

const DEFAULT_EXTENDED: ExtendedFireInputs = {
  base: {
    currentAge: 30,
    retirementAge: 45,
    lifeExpectancy: 90,
    currentMonthlyExpense: 50000,
    medicalMonthlyExpense: 0,
    lifestyleBuffer: 0,
    expectedReturnPre: 12,
    expectedReturnPost: 8,
  },
  expenses: null,
  income: null,
  allocation: null,
  liabilities: null,
  assumptions: { withdrawalRate: 3.5, generalInflation: 6, medicalInflation: 10 },
  nps: null,
  goalDeductions: null,
}

export default function CalculatorPage() {
  const { data: savedProfile, isLoading } = useFireProfile()
  const { data: holdings } = useHoldings()
  const { data: goals } = useGoals()
  const [inputs, setInputs] = useState<ExtendedFireInputs>(DEFAULT_EXTENDED)

  useEffect(() => {
    if (savedProfile) setInputs(savedProfile)
  }, [savedProfile])

  const currentYear = new Date().getFullYear()

  // Inject goal deductions from Goals page
  const extendedWithGoals: ExtendedFireInputs = useMemo(() => {
    if (!goals || goals.length === 0) return inputs
    const deductions: GoalDeduction[] = goals
      .filter((g) => g.category !== 'FIRE' && g.targetYear > currentYear)
      .map((g) => ({
        name: g.name,
        targetYear: g.targetYear,
        inflationAdjustedAmount:
          g.targetAmount *
          Math.pow(1 + g.inflationRate / 100, g.targetYear - currentYear),
      }))
    return { ...inputs, goalDeductions: deductions.length > 0 ? deductions : null }
  }, [inputs, goals, currentYear])

  const currentPortfolio = holdings
    ? holdings.reduce((sum, h) => sum + h.currentValue, 0)
    : 0

  const result = useMemo(
    () => runFireSimulation(extendedWithGoals, currentPortfolio),
    [extendedWithGoals, currentPortfolio],
  )

  const hasSimulation = result.simulationYears.length > 0

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-theme-muted text-sm animate-pulse">Loading profile…</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-theme-text">FIRE Calculator</h1>
          <p className="text-sm text-theme-muted mt-1">
            Desi FIRE · Multi-variable simulation · SWR{' '}
            {inputs.assumptions?.withdrawalRate ?? 3.5}% · Inflation-adjusted
          </p>
        </div>

        {/* Row 1: Inputs + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <InputPanel
            inputs={inputs}
            section80cUtilization={result.section80cUtilization}
            onChange={setInputs}
          />

          <div className="flex flex-col gap-4">
            <ResultPanel result={result} currentPortfolio={currentPortfolio} />
            <InflationBreakdown
              inputs={inputs.base}
              yearsToRetirement={result.yearsToRetirement}
              categories={inputs.expenses}
              generalInflation={inputs.assumptions?.generalInflation}
              medicalInflation={inputs.assumptions?.medicalInflation}
            />
          </div>
        </div>

        {/* Row 2: Projection chart (full width) */}
        <ProjectionChart
          inputs={inputs.base}
          result={result}
          currentPortfolio={currentPortfolio}
        />

        {/* Row 3: Cashflow + Sensitivity (extended mode only) */}
        {hasSimulation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <CashflowChart
              years={result.simulationYears}
              retirementAge={inputs.base.retirementAge}
            />
            <SensitivityPanel
              withdrawalRateSensitivity={result.withdrawalRateSensitivity}
              inflationSensitivity={result.inflationSensitivity}
              currentWithdrawalRate={inputs.assumptions?.withdrawalRate ?? 3.5}
              currentInflation={inputs.assumptions?.generalInflation ?? 6}
              lifeExpectancy={inputs.base.lifeExpectancy}
            />
          </div>
        )}

        {/* Row 4: Net worth table (extended mode only) */}
        {hasSimulation && (
          <NetWorthTable
            years={result.simulationYears}
            retirementAge={inputs.base.retirementAge}
          />
        )}
      </div>
    </PageWrapper>
  )
}
