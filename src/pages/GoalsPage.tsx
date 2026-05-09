import { useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { FireGoalCard } from '../components/goals/FireGoalCard'
import { MilestoneGoalCard } from '../components/goals/MilestoneGoalCard'
import { AddGoalModal } from '../components/goals/AddGoalModal'
import { TotalGoalsOverview } from '../components/goals/TotalGoalsOverview'
import { BadgeGrid } from '../components/gamification/BadgeGrid'
import { useGoals, useAddGoal } from '../hooks/useGoals'
import { useFireProfile } from '../hooks/useFireProfile'
import { useHoldings } from '../hooks/useHoldings'
import { useGamification } from '../hooks/useGamification'
import { useGoalsUIStore } from '../stores/goalsUIStore'
import { computeFireResult } from '../utils/fireCalc'
import type { GoalInput } from '../types/goals'
import type { FireInputs } from '../types/fire'

const DEFAULT_FIRE_INPUTS: FireInputs = {
  currentAge: 30, retirementAge: 45, lifeExpectancy: 90,
  currentMonthlyExpense: 50000, medicalMonthlyExpense: 0, lifestyleBuffer: 0,
  expectedReturnPre: 12, expectedReturnPost: 8,
}

const SEED_GOALS: GoalInput[] = [
  { name: 'Parents Care',   category: 'PARENTS',   targetAmount: 3_000_000,  targetYear: 2035, currentAllocation: 0, inflationRate: 6  },
  { name: 'Child Education', category: 'EDUCATION', targetAmount: 5_000_000,  targetYear: 2038, currentAllocation: 0, inflationRate: 10 },
  { name: 'Child Wedding',  category: 'WEDDING',   targetAmount: 4_000_000,  targetYear: 2042, currentAllocation: 0, inflationRate: 6  },
  { name: 'Primary Home',   category: 'HOUSING',   targetAmount: 15_000_000, targetYear: 2030, currentAllocation: 0, inflationRate: 8  },
]

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals()
  const { data: fireProfile } = useFireProfile()
  const { data: holdings } = useHoldings()
  const { data: gamification } = useGamification()
  const { mutate: addGoal } = useAddGoal()
  const { modalOpen, editingGoal, openAdd, closeModal } = useGoalsUIStore()
  const hasSeedStarted = useRef(false)
  const addGoalRef = useRef(addGoal)
  addGoalRef.current = addGoal

  const currentPortfolio = holdings?.reduce((sum, h) => sum + h.currentValue, 0) ?? 0
  const fireResult = computeFireResult(fireProfile?.base ?? DEFAULT_FIRE_INPUTS, currentPortfolio)

  useEffect(() => {
    if (!goals || isLoading || hasSeedStarted.current) return
    if (goals.length > 0) return
    hasSeedStarted.current = true
    SEED_GOALS.forEach((g) => addGoalRef.current(g))
  }, [goals, isLoading])

  const milestoneGoals = goals?.filter((g) => g.category !== 'FIRE') ?? []

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-theme-muted text-sm animate-pulse">Loading goals…</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-theme-text">Goal Tracker</h1>
            <p className="text-sm text-theme-muted mt-1">
              FIRE corpus + milestone goals — all inflation-adjusted.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary shrink-0 min-h-[44px]"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        <FireGoalCard result={fireResult} currentPortfolio={currentPortfolio} />

        {milestoneGoals.length > 0 && (
          <TotalGoalsOverview goals={milestoneGoals} currentPortfolio={currentPortfolio} />
        )}

        {milestoneGoals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {milestoneGoals.map((goal) => (
              <MilestoneGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 rounded-xl border border-theme-border border-dashed">
            <p className="text-theme-muted text-sm">No milestone goals yet — add one above.</p>
          </div>
        )}
      </div>

      {gamification && (
        <div className="mt-2">
          <BadgeGrid badges={gamification.badges} />
        </div>
      )}

      {modalOpen && <AddGoalModal goal={editingGoal} onClose={closeModal} />}
    </PageWrapper>
  )
}
