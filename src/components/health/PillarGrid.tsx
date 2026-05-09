import { CheckCircle, XCircle } from 'lucide-react'
import type { PillarScore } from '../../types/health'

interface PillarGridProps {
  pillars: PillarScore[]
}

function scoreColor(score: number) {
  if (score >= 70) return 'text-success'
  if (score >= 40) return 'text-warning'
  return 'text-danger'
}

function scoreBarColor(score: number) {
  if (score >= 70) return 'bg-success'
  if (score >= 40) return 'bg-warning'
  return 'bg-danger'
}

export const PillarGrid = ({ pillars }: PillarGridProps) => (
  <div className="bg-theme-card border border-theme-border rounded-xl p-5">
    <p className="text-xs text-theme-muted uppercase tracking-wider mb-4">6-Pillar Breakdown</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {pillars.map((pillar) => (
        <div
          key={pillar.name}
          className="bg-theme-bg border border-theme-border rounded-lg p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-theme-text">{pillar.name}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold font-mono ${scoreColor(pillar.score)}`}>
                {pillar.score}
              </span>
              {pillar.pass ? (
                <CheckCircle size={14} className="text-success shrink-0" />
              ) : (
                <XCircle size={14} className="text-danger shrink-0" />
              )}
            </div>
          </div>
          <div className="h-1.5 bg-theme-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(pillar.score)}`}
              style={{ width: `${pillar.score}%` }}
            />
          </div>
          <p className="text-xs text-theme-muted leading-relaxed">{pillar.summary}</p>
        </div>
      ))}
    </div>
  </div>
)
