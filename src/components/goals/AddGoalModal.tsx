import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAddGoal, useUpdateGoal } from '../../hooks/useGoals'
import type { Goal, GoalCategory, GoalInput } from '../../types/goals'

interface AddGoalModalProps {
  goal: Goal | null
  onClose: () => void
}

const CATEGORIES: GoalCategory[] = ['EDUCATION', 'WEDDING', 'PARENTS', 'HOUSING', 'OTHER']
const CATEGORY_LABELS: Record<GoalCategory, string> = {
  FIRE: 'FIRE', EDUCATION: 'Education', WEDDING: 'Wedding',
  PARENTS: 'Parents', HOUSING: 'Housing', OTHER: 'Other',
}
const CURRENT_YEAR = new Date().getFullYear()

function blankForm(): GoalInput {
  return { name: '', category: 'OTHER', targetAmount: 0, targetYear: CURRENT_YEAR + 5, currentAllocation: 0, inflationRate: 6 }
}

function goalToForm(g: Goal): GoalInput {
  return { name: g.name, category: g.category, targetAmount: g.targetAmount, targetYear: g.targetYear, currentAllocation: g.currentAllocation, inflationRate: g.inflationRate, notes: g.notes }
}

export const AddGoalModal = ({ goal, onClose }: AddGoalModalProps) => {
  const { mutate: addGoal, isPending: adding } = useAddGoal()
  const { mutate: updateGoal, isPending: updating } = useUpdateGoal()
  const [form, setForm] = useState<GoalInput>(goal ? goalToForm(goal) : blankForm())

  useEffect(() => {
    setForm(goal ? goalToForm(goal) : blankForm())
  }, [goal])

  const isPending = adding || updating

  const set = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal) {
      updateGoal({ id: goal.id, input: form }, { onSuccess: onClose })
    } else {
      addGoal(form, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-theme-card border border-theme-border rounded-2xl w-full max-w-md p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-theme-text">
            {goal ? 'Edit Goal' : 'Add Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="goal-name">Goal name</label>
            <input
              id="goal-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Child's college fund"
              className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="goal-category">Category</label>
              <select
                id="goal-category"
                value={form.category}
                onChange={(e) => set('category', e.target.value as GoalCategory)}
                className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="goal-year">Target year</label>
              <input
                id="goal-year"
                type="number"
                value={form.targetYear}
                min={CURRENT_YEAR}
                onChange={(e) => set('targetYear', Number(e.target.value))}
                className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="goal-target">Target amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none">₹</span>
                <input
                  id="goal-target"
                  type="number"
                  value={form.targetAmount}
                  min={0}
                  onChange={(e) => set('targetAmount', Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="goal-alloc">Current allocation (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none">₹</span>
                <input
                  id="goal-alloc"
                  type="number"
                  value={form.currentAllocation}
                  min={0}
                  onChange={(e) => set('currentAllocation', Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="goal-inflation">Inflation rate (% p.a.)</label>
            <input
              id="goal-inflation"
              type="number"
              value={form.inflationRate}
              min={0}
              max={30}
              step={0.5}
              onChange={(e) => set('inflationRate', Number(e.target.value))}
              className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !form.name.trim()}
            className="w-full py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            {isPending ? 'Saving…' : goal ? 'Update Goal' : 'Add Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}
