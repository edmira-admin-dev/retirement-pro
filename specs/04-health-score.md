# 04 — Health Score

**Goal:** Compute a Financial Wellness Score (0–100) across 6 pillars from server-persisted inputs, with actionable recommendations.

**Depends on:** 01-portfolio-ledger.md

---

## User Story

As a user, I want a financial health checkup that scores my position across 6 pillars and tells me exactly what to fix.

---

## Screens / Components

- `HealthPage` — full page
- `HealthScoreGauge` — radial gauge 0–100, color zones: red <40, amber 40–69, green ≥70
- `PillarGrid` — 6 cards, each: pillar name, score, status icon, 1-line summary
- `RatioTable` — ratio name | your value | healthy range | pass/fail icon
- `RecommendationList` — ordered action items derived from failing ratios
- `HealthStatusBadge` — "Financially Healthy" / "Coping" / "Vulnerable"

---

## Data Shape

```typescript
interface HealthInputs {
  monthlyIncome: number       // ₹
  monthlyExpenses: number
  monthlyEMIs: number
  liquidAssets: number
  totalLiabilities: number
  monthlySavings: number
  hasTermInsurance: boolean
  hasHealthInsurance: boolean
  hasWill: boolean
  hasNominations: boolean
}

// Computed client-side only
interface HealthResult {
  overallScore: number
  status: 'Healthy' | 'Coping' | 'Vulnerable'
  pillars: { name: string; score: number }[]
  ratios: { name: string; value: number; min?: number; max?: number; pass: boolean }[]
  recommendations: string[]
}
```

## State

- TanStack Query: `useHealthProfile()` → `GET /health`; `useSaveHealthProfile()` → `PUT /health`
- Auto-save on blur (debounced 800ms)
- `totalAssets` injected from `useHoldings()` net worth — not in form
- `HealthResult` computed client-side; never sent to server

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useHealthProfile` | GET | `/health` |
| `useSaveHealthProfile` | PUT | `/health` |

---

## Key Logic

**6 Pillars (equal weight ~16.7 pts each):**
1. Liquidity — `liquidAssets / monthlyExpenses` → 3–6 target
2. Budgeting — `(income - expenses) / income` → > 25%
3. Savings Efficiency — `savings / (income - expenses)` → > 75%
4. Debt — `EMIs / income` → < 35%; > 40% = fail
5. Solvency — `(totalAssets - totalLiabilities) / totalAssets` → > 20%
6. Protection — 4 binary checks (term, health, will, nominations) × 25 pts each

**Score thresholds:** ≥70 = Healthy; 40–69 = Coping; <40 = Vulnerable

**Recommendations (examples):**
- DTI > 40% → "Prepay high-interest loans before increasing SIPs"
- No term insurance → "Get term cover of ≥15x annual income"
- Liquidity < 3 months → "Build emergency fund before investing further"

---

## Routes

| Path | Component |
|------|-----------|
| `/health` | `HealthPage` |

---

## Acceptance Criteria

- [ ] Inputs auto-save to API; restored on page load
- [ ] `totalAssets` pre-filled from holdings — read-only in UI
- [ ] Score and all 6 pillars update on every input change
- [ ] At least 3 recommendations for a user failing 3+ ratios
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Health Score feature per `specs/04-health-score.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + TanStack Query + Axios. Inputs auto-save to API. Scoring is client-side only. Dark fintech theme.
