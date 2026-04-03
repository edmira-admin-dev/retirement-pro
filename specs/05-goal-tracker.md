# 05 — Goal Tracker

**Goal:** CRUD for FIRE goal + Indian milestone sub-goals, all persisted to the API.

**Depends on:** 02-fire-calculator.md

---

## User Story

As a FIRE aspirant, I want to define and track my primary FIRE goal and life milestones so I know my total funding requirement across all objectives.

---

## Screens / Components

- `GoalsPage` — full page
- `FireGoalCard` — primary card: target corpus (from fire store), current portfolio, % achieved, years remaining
- `MilestoneGoalCard` — per sub-goal: name, inflation-adjusted target, current allocation, progress bar, edit/delete
- `AddGoalModal` — form: name, category select, target ₹, target year, inflation rate, current allocation
- `GoalProgressBar` — animated, color: green ≥75%, amber 40–74%, red <40%
- `TotalGoalsOverview` — sum of all goals' adjusted targets vs total portfolio

---

## Data Shape

```typescript
type GoalCategory = 'FIRE' | 'EDUCATION' | 'WEDDING' | 'PARENTS' | 'HOUSING' | 'OTHER'

interface Goal {
  id: string
  name: string
  category: GoalCategory
  targetAmount: number        // ₹
  targetYear: number
  currentAllocation: number   // ₹
  inflationRate: number       // % pa
  notes?: string
}

type GoalInput = Omit<Goal, 'id'>
```

## State

- TanStack Query: `useGoals()` → `GET /goals`
- Mutations: `useAddGoal()`, `useUpdateGoal()`, `useDeleteGoal()` — all invalidate `['goals']`
- `targetCorpus` for FireGoalCard sourced from client-side FIRE calculation (no API call)
- `currentPortfolioValue` sourced from `useHoldings()` net worth
- Zustand (UI only): `modalOpen: boolean`, `editingGoal: Goal | null`

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useGoals` | GET | `/goals` |
| `useAddGoal` | POST | `/goals` |
| `useUpdateGoal` | PATCH | `/goals/:id` |
| `useDeleteGoal` | DELETE | `/goals/:id` |

---

## Key Logic

- `adjustedTarget = targetAmount * (1 + inflationRate/100)^yearsRemaining`
- `progress = min(currentAllocation / adjustedTarget * 100, 100)`
- `yearsRemaining = targetYear - new Date().getFullYear()`
- On first load with empty goals list: seed 4 default goals via `POST /goals` × 4:
  - Parents Care — ₹30L — 2035 — 6%
  - Child Education — ₹50L — 2038 — 10%
  - Child Wedding — ₹40L — 2042 — 6%
  - Primary Home — ₹1.5Cr — 2030 — 8%
- Total pressure warning: if `sum(adjustedTargets) > currentPortfolio * 1.5` → show banner

---

## Routes

| Path | Component |
|------|-----------|
| `/goals` | `GoalsPage` |

---

## Acceptance Criteria

- [ ] Goals load from API; CRUD persists to DB
- [ ] FireGoalCard shows live data from FIRE calculation
- [ ] 4 default goals seeded on empty state
- [ ] Inflation-adjusted target visible per goal
- [ ] Total pressure warning fires when threshold exceeded
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Goal Tracker per `specs/05-goal-tracker.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + TanStack Query + Axios. Full API CRUD. Seed 4 defaults on empty state. Dark fintech theme.
