import React from 'react'
import { BadgeCard } from './BadgeCard'
import { BADGE_DEFS } from '../../hooks/useGamification'
import type { Badge } from '../../types/gamification'

interface BadgeGridProps {
  badges: Badge[]
}

const CATEGORY_LABEL: Record<Badge['category'], string> = {
  portfolio:   'Portfolio',
  goals:       'Goals',
  health:      'Health',
  consistency: 'Consistency',
}

const CATEGORY_ORDER: Badge['category'][] = ['portfolio', 'goals', 'health', 'consistency']

const HINT_MAP = Object.fromEntries(BADGE_DEFS.map((d) => [d.id, d.unlockHint]))

export const BadgeGrid = React.memo(function BadgeGrid({ badges }: BadgeGridProps) {
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-theme-text">Achievements</h2>
          <p className="text-xs text-theme-muted mt-0.5">
            {earnedCount} / {badges.length} unlocked
          </p>
        </div>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const categoryBadges = badges.filter((b) => b.category === category)
        if (categoryBadges.length === 0) return null

        return (
          <div key={category} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-theme-muted">
              {CATEGORY_LABEL[category]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {categoryBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  unlockHint={HINT_MAP[badge.id] ?? ''}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
})
