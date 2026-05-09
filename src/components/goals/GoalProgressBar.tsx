import React from 'react'

interface GoalProgressBarProps {
  progress: number // 0–100
  className?: string
}

export const GoalProgressBar = React.memo(({ progress, className = '' }: GoalProgressBarProps) => {
  const clamped = Math.min(Math.max(progress, 0), 100)
  const color =
    clamped >= 75 ? 'bg-theme-primary' :
    clamped >= 40 ? 'bg-warning' :
    'bg-danger'

  return (
    <div className={`h-2 w-full bg-theme-bg rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
})
GoalProgressBar.displayName = 'GoalProgressBar'
