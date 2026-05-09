import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ArrowRight, TrendingUp } from 'lucide-react'
import { formatRupeesCompact } from '../../utils/money'
import type { FireResult } from '../../types/fire'

interface Props {
  netWorth: number
  fireResult: FireResult | null
  hasProfile: boolean
}

interface MetricProps {
  label: string
  value: string
  highlight?: boolean
}

const Metric = memo(function Metric({ label, value, highlight }: MetricProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-theme-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold font-mono ${highlight ? 'text-theme-primary' : 'text-theme-text'}`}>
        {value}
      </span>
    </div>
  )
})

export const FireProgressCard = memo(function FireProgressCard({ netWorth, fireResult, hasProfile }: Props) {
  const navigate = useNavigate()

  if (!hasProfile || !fireResult) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-theme-muted" />
          <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">FIRE Progress</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-theme-border flex items-center justify-center">
            <TrendingUp size={22} className="text-theme-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-text">Calculate your FIRE target</p>
            <p className="text-xs text-theme-muted mt-0.5">Set your retirement inputs to track corpus progress</p>
          </div>
          <button
            onClick={() => navigate('/calculator')}
            className="mt-1 px-4 py-2 rounded-lg bg-theme-primary text-white text-xs font-semibold hover:bg-theme-primary-dark transition-colors cursor-pointer"
          >
            Open Calculator
          </button>
        </div>
      </div>
    )
  }

  const { effectiveCorpus, yearsToRetirement, monthlySipRequired, isFireAchieved } = fireResult
  const progressPct = effectiveCorpus > 0
    ? Math.min((netWorth / effectiveCorpus) * 100, 100)
    : 0
  const progressColor = progressPct >= 100
    ? '#22c55e'
    : progressPct >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-theme-muted" />
          <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">FIRE Progress</span>
        </div>
        {isFireAchieved && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-theme-primary/15 text-theme-primary">
            FIRE Achieved!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-lg font-bold font-mono text-theme-text">
            {progressPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-theme-muted">
            {formatRupeesCompact(netWorth)} of {formatRupeesCompact(effectiveCorpus)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-theme-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-theme-border">
        <Metric label="Years Left" value={String(yearsToRetirement)} />
        <Metric
          label="SIP / mo"
          value={isFireAchieved ? '—' : formatRupeesCompact(monthlySipRequired)}
          highlight={!isFireAchieved}
        />
        <Metric label="Net Worth" value={formatRupeesCompact(netWorth)} />
      </div>

      <button
        onClick={() => navigate('/calculator')}
        className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors cursor-pointer group"
      >
        View projections
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
})
