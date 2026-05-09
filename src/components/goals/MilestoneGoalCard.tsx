import { useState } from 'react'
import { Pencil, Trash2, AlertCircle } from 'lucide-react'
import { GoalProgressBar } from './GoalProgressBar'
import { useDeleteGoal } from '../../hooks/useGoals'
import { useGoalsUIStore } from '../../stores/goalsUIStore'
import { formatRupeesCompact } from '../../utils/money'
import type { Goal } from '../../types/goals'

interface MilestoneGoalCardProps {
  goal: Goal
}

const CURRENT_YEAR = new Date().getFullYear()

const CATEGORY_META: Record<Goal['category'], { label: string; color: string }> = {
  FIRE:      { label: 'FIRE',      color: 'text-theme-primary bg-theme-primary/10' },
  EDUCATION: { label: 'Education', color: 'text-blue-400 bg-blue-400/10' },
  WEDDING:   { label: 'Wedding',   color: 'text-pink-400 bg-pink-400/10' },
  PARENTS:   { label: 'Parents',   color: 'text-amber-400 bg-amber-400/10' },
  HOUSING:   { label: 'Housing',   color: 'text-violet-400 bg-violet-400/10' },
  OTHER:     { label: 'Other',     color: 'text-theme-muted bg-theme-border' },
}

export const MilestoneGoalCard = ({ goal }: MilestoneGoalCardProps) => {
  const { mutate: deleteGoal, isPending: deleting } = useDeleteGoal()
  const openEdit = useGoalsUIStore((s) => s.openEdit)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const yearsRemaining = Math.max(goal.targetYear - CURRENT_YEAR, 0)
  const adjustedTarget = goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, yearsRemaining)
  const progress = adjustedTarget > 0
    ? Math.min((goal.currentAllocation / adjustedTarget) * 100, 100)
    : 0
  const meta = CATEGORY_META[goal.category]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-sm font-medium text-theme-text truncate">{goal.name}</p>
          <span className={`self-start text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => openEdit(goal)}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            aria-label={`Edit ${goal.name}`}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-theme-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            aria-label={`Delete ${goal.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-theme-muted mb-0.5">Infl-adj. target</p>
          <p className="text-sm font-semibold text-theme-text font-mono">{formatRupeesCompact(adjustedTarget)}</p>
          <p className="text-xs text-theme-muted mt-0.5">
            {yearsRemaining > 0 ? `in ${yearsRemaining}y @ ${goal.inflationRate}% p.a.` : 'Target year reached'}
          </p>
        </div>
        <div>
          <p className="text-xs text-theme-muted mb-0.5">Current allocation</p>
          <p className="text-sm font-semibold text-theme-primary font-mono">{formatRupeesCompact(goal.currentAllocation)}</p>
          <p className="text-xs text-theme-muted mt-0.5">Target: {goal.targetYear}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-theme-muted">Progress</p>
          <p className="text-xs font-mono text-theme-text">{progress.toFixed(1)}%</p>
        </div>
        <GoalProgressBar progress={progress} />
      </div>

      {confirmDelete && (
        <div className="flex items-center gap-2 pt-2 border-t border-theme-border">
          <AlertCircle size={14} className="text-danger shrink-0" />
          <p className="text-xs text-theme-muted flex-1">Remove this goal?</p>
          <button
            onClick={() => { deleteGoal(goal.id); setConfirmDelete(false) }}
            disabled={deleting}
            className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? '…' : 'Remove'}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
