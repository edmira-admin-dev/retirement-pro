import { useState, useEffect } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { HealthScoreGauge } from '../components/health/HealthScoreGauge'
import { PillarGrid } from '../components/health/PillarGrid'
import { RatioTable } from '../components/health/RatioTable'
import { RecommendationList } from '../components/health/RecommendationList'
import { HealthInputForm } from '../components/health/HealthInputForm'
import { useHealthProfile } from '../hooks/useHealthProfile'
import { useHoldings } from '../hooks/useHoldings'
import { computeHealthResult } from '../utils/healthCalc'
import type { HealthInputs } from '../types/health'

const DEFAULT_INPUTS: HealthInputs = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlyEMIs: 0,
  liquidAssets: 0,
  totalLiabilities: 0,
  monthlySavings: 0,
  hasTermInsurance: false,
  hasHealthInsurance: false,
  hasWill: false,
  hasNominations: false,
}

export default function HealthPage() {
  const { data: savedProfile, isLoading } = useHealthProfile()
  const { data: holdings } = useHoldings()

  const totalAssets = holdings?.reduce((sum, h) => sum + h.currentValue, 0) ?? 0

  const [inputs, setInputs] = useState<HealthInputs>(DEFAULT_INPUTS)

  useEffect(() => {
    if (savedProfile) setInputs(savedProfile)
  }, [savedProfile])

  const result = computeHealthResult(inputs, totalAssets)

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-theme-muted text-sm">Loading health profile…</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-theme-text">Financial Health Score</h1>
          <p className="text-sm text-theme-muted mt-1">
            A 6-pillar diagnostic of your financial wellness — updates as you type.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col — inputs */}
          <div className="lg:col-span-1">
            <HealthInputForm
              inputs={inputs}
              totalAssets={totalAssets}
              onChange={setInputs}
            />
          </div>

          {/* Right cols — results */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HealthScoreGauge result={result} />
              <RecommendationList recommendations={result.recommendations} />
            </div>
            <PillarGrid pillars={result.pillars} />
            <RatioTable ratios={result.ratios} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
