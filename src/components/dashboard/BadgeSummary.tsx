import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, Trophy, Flame, Heart, Target,
  TrendingUp, BarChart2, Award, Zap, Star,
} from 'lucide-react'
import type { Badge } from '../../types/gamification'

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Trophy, Flame, Heart, Target,
  TrendingUp, BarChart2, Award, Zap, Star,
}

interface Props {
  badges: Badge[]
  streak: number
}

export const BadgeSummary = memo(function BadgeSummary({ badges, streak }: Props) {
  const navigate = useNavigate()
  const earned = badges.filter((b) => b.earned)
  const locked = badges.filter((b) => !b.earned)
  const earnedCount = earned.length
  const totalCount = badges.length

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-theme-text">Achievements</h2>
          <p className="text-xs text-theme-muted mt-0.5">
            {earnedCount} of {totalCount} badges earned
            {streak > 0 && ` · ${streak}-day streak`}
          </p>
        </div>
        <button
          onClick={() => navigate('/goals')}
          className="text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors cursor-pointer"
        >
          View all →
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-theme-border overflow-hidden">
        <div
          className="h-full rounded-full bg-theme-primary transition-all duration-700"
          style={{ width: `${(earnedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Earned badges */}
      {earnedCount > 0 ? (
        <div className="flex flex-wrap gap-2">
          {earned.map((badge) => {
            const Icon = ICON_MAP[badge.icon] ?? Award
            return (
              <div
                key={badge.id}
                title={badge.name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-primary/10 border border-theme-primary/20"
              >
                <Icon size={11} className="text-theme-primary" />
                <span className="text-[11px] font-semibold text-theme-primary">{badge.name}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-theme-muted">
          Add a holding to earn your first badge
        </p>
      )}

      {/* Locked hints — show first 2 */}
      {locked.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-theme-border">
          <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider">Up next</p>
          {locked.slice(0, 2).map((badge) => {
            const Icon = ICON_MAP[badge.icon] ?? Award
            return (
              <div key={badge.id} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-theme-border flex items-center justify-center shrink-0">
                  <Icon size={10} className="text-theme-muted" />
                </div>
                <span className="text-[11px] text-theme-muted line-clamp-1">{badge.name}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
