import React from 'react'
import {
  Briefcase, Trophy, Flame, Heart, Target,
  TrendingUp, BarChart2, Award, Zap, Star, HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Badge } from '../../types/gamification'

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase, Trophy, Flame, Heart, Target, TrendingUp, BarChart2, Award, Zap, Star,
}

const CATEGORY_COLOR: Record<Badge['category'], string> = {
  portfolio:   'text-theme-primary',
  goals:       'text-blue-400',
  health:      'text-rose-400',
  consistency: 'text-amber-400',
}

const CATEGORY_BG: Record<Badge['category'], string> = {
  portfolio:   'bg-theme-primary/10 border-theme-primary/30',
  goals:       'bg-blue-400/10 border-blue-400/30',
  health:      'bg-rose-400/10 border-rose-400/30',
  consistency: 'bg-amber-400/10 border-amber-400/30',
}

interface BadgeCardProps {
  badge: Badge
  unlockHint: string
}

export const BadgeCard = React.memo(function BadgeCard({ badge, unlockHint }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] ?? HelpCircle
  const earned = badge.earned

  return (
    <div
      className={[
        'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
        earned
          ? `${CATEGORY_BG[badge.category]} shadow-sm`
          : 'bg-theme-card border-theme-border opacity-40 grayscale',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center justify-center w-11 h-11 rounded-full',
          earned ? CATEGORY_BG[badge.category] : 'bg-theme-border',
        ].join(' ')}
      >
        <Icon
          size={22}
          className={earned ? CATEGORY_COLOR[badge.category] : 'text-theme-muted'}
        />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 w-full">
        <p className={`text-sm font-semibold leading-tight ${earned ? 'text-theme-text' : 'text-theme-muted'}`}>
          {badge.name}
        </p>
        <p className="text-xs text-theme-muted leading-tight line-clamp-2">
          {earned ? badge.description : unlockHint}
        </p>
      </div>

      {earned && badge.earnedDate && (
        <p className={`text-[10px] font-medium ${CATEGORY_COLOR[badge.category]}`}>
          {new Date(badge.earnedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </p>
      )}
    </div>
  )
})
