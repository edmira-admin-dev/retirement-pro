import React from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { GoalProgressBar } from './GoalProgressBar'
import { formatRupeesCompact } from '../../utils/money'
import type { FireResult } from '../../types/fire'

interface FireGoalCardProps {
  result: FireResult
  currentPortfolio: number
}

export const FireGoalCard = React.memo(({ result, currentPortfolio }: FireGoalCardProps) => {
  const { effectiveCorpus, yearsToRetirement, isFireAchieved } = result
  const progress = effectiveCorpus > 0
    ? Math.min((currentPortfolio / effectiveCorpus) * 100, 100)
    : 0

  return (
    <div className={`bg-theme-card border rounded-xl p-5 flex flex-col gap-4 ${isFireAchieved ? 'border-theme-primary/40' : 'border-theme-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-theme-primary" />
            <p className="text-sm font-semibold text-theme-text">FIRE Goal</p>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">Primary retirement corpus — sourced from FIRE Calculator</p>
        </div>
        {isFireAchieved && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-primary/15 text-theme-primary text-xs font-semibold shrink-0">
            <CheckCircle size={12} />
            FIRE Achieved
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-theme-muted mb-1">Target Corpus</p>
          <p className="text-base font-bold text-theme-text font-mono">{formatRupeesCompact(effectiveCorpus)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-1">Current Portfolio</p>
          <p className="text-base font-bold text-theme-primary font-mono">{formatRupeesCompact(currentPortfolio)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-1">Years Remaining</p>
          <p className="text-base font-bold text-theme-text font-mono">{yearsToRetirement}y</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-theme-muted">Progress to corpus</p>
          <p className="text-xs font-mono text-theme-text">{progress.toFixed(1)}%</p>
        </div>
        <GoalProgressBar progress={progress} />
      </div>
    </div>
  )
})
FireGoalCard.displayName = 'FireGoalCard'
