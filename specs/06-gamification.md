# 06 — Gamification

**Goal:** Persist badge state and streaks to the API; award badges automatically based on cross-store conditions.

**Depends on:** 05-goal-tracker.md

---

## User Story

As a young saver, I want instant recognition for financial milestones so I stay engaged with a 20-year plan.

---

## Screens / Components

- `BadgeGrid` — grid on `GoalsPage` or `DashboardPage`; earned = colored, locked = grayscale
- `BadgeCard` — icon + name + unlock condition + earned date
- `StreakCounter` — "X day streak" with flame icon in `TopBar`
- `NudgeBanner` — contextual tip, dismissible, max 1 visible per session

---

## Data Shape

```typescript
interface Badge {
  id: string
  name: string
  description: string
  icon: string            // Lucide icon name
  earned: boolean
  earnedDate?: string
  category: 'portfolio' | 'goals' | 'health' | 'consistency'
}

// Sent to PATCH /gamification
interface GamificationPatch {
  badges?: Badge[]
  streakDays?: number
  lastVisitDate?: string
  dismissedNudges?: string[]
}
```

## State

- TanStack Query: `useGamification()` → `GET /gamification`
- Mutation: `useUpdateGamification()` → `PATCH /gamification`
- On app boot: `checkAndAwardBadges()` runs after all queries resolve — patches only if badges changed
- Zustand (UI only): `activeNudge: string | null`

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useGamification` | GET | `/gamification` |
| `useUpdateGamification` | PATCH | `/gamification` |

---

## Key Logic

**Badge unlock conditions (read from other queries):**
| Badge ID | Condition |
|----------|-----------|
| `first-holding` | `holdings.length >= 1` |
| `triple-threat` | holdings contain MF + NPS + EPF |
| `fire-starter` | `fireProfile` exists |
| `health-check` | `healthProfile` exists |
| `goal-setter` | `goals.length >= 3` |
| `corpus-10pct` | portfolio ≥ 10% of targetCorpus |
| `corpus-50pct` | portfolio ≥ 50% of targetCorpus |
| `corpus-100pct` | portfolio ≥ targetCorpus |
| `week-warrior` | `streakDays >= 7` |
| `monthly-discipline` | `streakDays >= 30` |

**Streak logic (run on app boot, before rendering):**
- `today = new Date().toISOString().slice(0,10)`
- if `lastVisitDate === yesterday` → `streakDays++`
- if `lastVisitDate === today` → no change
- else → `streakDays = 1`
- PATCH if changed

**Nudge triggers (once per session, priority order):**
1. `healthProfile` null → "Run your first health check to see your score"
2. Health DTI > 40% → "Your debt load is high — consider prepaying before increasing SIPs"
3. Any holding's `lastUpdated` > 30 days ago → "Your portfolio values may be stale — update for accurate projections"

---

## Acceptance Criteria

- [ ] Badges persist to DB and survive page refresh
- [ ] Badge unlocks on the next app boot after condition is met
- [ ] Streak increments on consecutive daily visits; resets on gap
- [ ] Locked badges render in grayscale with unlock hint
- [ ] Nudge banner dismissal persists across refresh
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Gamification layer per `specs/06-gamification.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + TanStack Query + Axios. Badge state and streaks persist to API. Conditions derive from other queries. Dark fintech theme.
