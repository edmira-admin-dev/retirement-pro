import { useState, useEffect } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { HealthScoreGauge } from '../components/health/HealthScoreGauge'
import { PillarGrid } from '../components/health/PillarGrid'
import { RatioTable } from '../components/health/RatioTable'
import { RecommendationList } from '../components/health/RecommendationList'
import { HealthInputForm } from '../components/health/HealthInputForm'
import { HealthScoreHistory } from '../components/health/HealthScoreHistory'
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

const LIQUID_CLASSES = new Set<string>(['BANK', 'LIQUID', 'FD'])

export default function HealthPage() {
  const { data: savedProfile, isLoading } = useHealthProfile()
  const { data: holdings } = useHoldings()

  const totalAssets = holdings?.reduce((sum, h) => sum + h.currentValue, 0) ?? 0
  const derivedLiquidAssets = holdings?.reduce(
    (sum, h) => LIQUID_CLASSES.has(h.assetClass) ? sum + h.currentValue : sum,
    0
  ) ?? 0

  const [inputs, setInputs] = useState<HealthInputs>(DEFAULT_INPUTS)

  useEffect(() => {
    if (savedProfile) setInputs(savedProfile)
  }, [savedProfile])

  const effectiveInputs: HealthInputs = { ...inputs, liquidAssets: derivedLiquidAssets }
  const result = computeHealthResult(effectiveInputs, totalAssets)

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col — inputs */}
          <div className="lg:col-span-1">
            <HealthInputForm
              inputs={effectiveInputs}
              totalAssets={totalAssets}
              score={result.overallScore}
              onChange={setInputs}
            />
          </div>

          {/* Right cols — results */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HealthScoreGauge result={result} />
              <RecommendationList recommendations={result.recommendations} />
            </div>
            <HealthScoreHistory />
            <PillarGrid pillars={result.pillars} />
            <RatioTable ratios={result.ratios} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
