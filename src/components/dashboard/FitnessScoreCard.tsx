import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, ClipboardList } from 'lucide-react'

interface Props {
  score: number
  status: 'Healthy' | 'Coping' | 'Vulnerable' | null
  recommendations: string[]
  hasProfile: boolean
}

const R = 38
const CIRC = 2 * Math.PI * R

function ringColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function statusStyles(status: 'Healthy' | 'Coping' | 'Vulnerable') {
  if (status === 'Healthy') return 'bg-theme-primary/15 text-theme-primary'
  if (status === 'Coping') return 'bg-warning/15 text-warning'
  return 'bg-danger/15 text-danger'
}

export const FitnessScoreCard = memo(function FitnessScoreCard({
  score, status, recommendations, hasProfile,
}: Props) {
  const navigate = useNavigate()

  if (!hasProfile) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-theme-muted" />
          <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Financial Fitness</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-theme-border flex items-center justify-center">
            <ClipboardList size={22} className="text-theme-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-theme-text">Run your diagnostic</p>
            <p className="text-xs text-theme-muted mt-0.5">Complete the health check to get your score</p>
          </div>
          <button
            onClick={() => navigate('/health')}
            className="mt-1 px-4 py-2 rounded-lg bg-theme-primary text-white text-xs font-semibold hover:bg-theme-primary-dark transition-colors cursor-pointer"
          >
            Start Health Check
          </button>
        </div>
      </div>
    )
  }

  const offset = CIRC * (1 - score / 100)
  const color = ringColor(score)

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Activity size={15} className="text-theme-muted" />
        <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Financial Fitness</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Radial ring */}
        <div className="relative shrink-0 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="var(--theme-border)" strokeWidth="9" />
            <circle
              cx="50" cy="50" r={R} fill="none"
              stroke={color} strokeWidth="9"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-theme-text font-mono leading-none">{score}</span>
            <span className="text-[10px] text-theme-muted mt-0.5">/100</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          {status && (
            <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles(status)}`}>
              {status}
            </span>
          )}
          {recommendations[0] && (
            <p className="text-[11px] text-theme-muted leading-relaxed line-clamp-3">
              <span className="text-warning font-semibold">Priority: </span>
              {recommendations[0]}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/health')}
        className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors cursor-pointer group"
      >
        View full diagnostic
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
})
