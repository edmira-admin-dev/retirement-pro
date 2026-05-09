import React from 'react'
import { Flame } from 'lucide-react'
import { useGamification } from '../../hooks/useGamification'

export const StreakCounter = React.memo(function StreakCounter() {
  const { data } = useGamification()
  const streakDays = data?.streakDays ?? 0

  if (streakDays === 0) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30">
      <Flame size={14} className="text-amber-400 shrink-0" />
      <span className="text-xs font-semibold text-amber-400 whitespace-nowrap">
        {streakDays} day{streakDays !== 1 ? 's' : ''}
      </span>
    </div>
  )
})
