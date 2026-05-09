import React from 'react'
import { Target, AlertTriangle } from 'lucide-react'
import { formatRupeesCompact } from '../../utils/money'
import type { Goal } from '../../types/goals'

interface TotalGoalsOverviewProps {
  goals: Goal[]
  currentPortfolio: number
}

const CURRENT_YEAR = new Date().getFullYear()

function computeAdjustedTarget(goal: Goal): number {
  const yr = Math.max(goal.targetYear - CURRENT_YEAR, 0)
  return goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, yr)
}

export const TotalGoalsOverview = React.memo(({ goals, currentPortfolio }: TotalGoalsOverviewProps) => {
  const totalAdjusted = goals.reduce((sum, g) => sum + computeAdjustedTarget(g), 0)
  const totalAllocation = goals.reduce((sum, g) => sum + g.currentAllocation, 0)
  const overallProgress = totalAdjusted > 0 ? Math.min((totalAllocation / totalAdjusted) * 100, 100) : 0
  const pressureWarning = totalAdjusted > currentPortfolio * 1.5

  return (
    <div className={`bg-theme-card border rounded-xl p-5 flex flex-col gap-4 ${pressureWarning ? 'border-warning/40' : 'border-theme-border'}`}>
      <div className="flex items-center gap-2">
        <Target size={16} className="text-theme-muted" />
        <p className="text-sm font-semibold text-theme-text">Goals Overview</p>
        <p className="text-xs text-theme-muted ml-auto">{goals.length} milestone{goals.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-theme-muted mb-1">Total required (infl-adj.)</p>
          <p className="text-base font-bold text-theme-text font-mono">{formatRupeesCompact(totalAdjusted)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-1">Total allocated</p>
          <p className="text-base font-bold text-theme-primary font-mono">{formatRupeesCompact(totalAllocation)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-1">Coverage</p>
          <p className="text-base font-bold text-theme-text font-mono">{overallProgress.toFixed(1)}%</p>
        </div>
      </div>

      {pressureWarning && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning leading-relaxed">
            <span className="font-semibold">High goal pressure:</span> Total milestone targets (
            {formatRupeesCompact(totalAdjusted)}) exceed 1.5× your portfolio (
            {formatRupeesCompact(currentPortfolio * 1.5)}). Increase allocations or extend timelines.
          </p>
        </div>
      )}
    </div>
  )
})
TotalGoalsOverview.displayName = 'TotalGoalsOverview'
