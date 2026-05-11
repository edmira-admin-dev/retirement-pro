# 18 — Consolidated Dashboard

**Goal:** Single unified overview screen combining net worth, cash flow, portfolio allocation, FIRE progress, and active alerts — the first screen users see after login.

**Depends on:** 12-cashflow-dashboard.md, 13-networth-engine.md, 16-asset-allocation.md, 05-goal-tracker.md

---

## User Story

As a user, I want a single dashboard that gives me the complete financial picture in 30 seconds — net worth, this month's cash flow, portfolio health, FIRE progress, and what needs my attention — so I don't need to visit 6 pages to understand my situation.

---

## Screens / Components

- `DashboardPage` — responsive grid of widgets (replaces existing placeholder)
- `NetWorthWidget` — hero number, MoM change, sparkline (7-day history)
- `CashFlowWidget` — this month: income vs expenses mini bar + savings rate ring
- `AllocationWidget` — mini donut: current allocation, drift alert badge if >5%
- `FireProgressWidget` — corpus accumulated / FIRE target %, progress bar
- `AlertsPanel` — actionable alerts: rebalancing needed, LTCG harvest opportunity, goal milestone, health score drop
- `RecentTransactionsWidget` — last 5 income + expense entries with icon + amount

---

## Data Shape

```typescript
interface DashboardSummary {
  netWorth: {
    currentPaise: number
    momChangePct: number
    sparkline: number[]      // 7 daily values (paise)
  }
  cashFlow: {
    month: string
    incomePaise: number
    expensesPaise: number
    savingsRatePct: number
  }
  allocation: {
    hasTarget: boolean
    maxDriftPct: number      // worst drifting asset class
    driftAlert: boolean      // true if any class > 5%
  }
  fireProgress: {
    targetCorpusPaise: number
    currentCorpusPaise: number
    progressPct: number
  }
  alerts: DashboardAlert[]
  recentTransactions: RecentTransaction[]
}

interface DashboardAlert {
  id: string
  type: 'REBALANCE' | 'LTCG_HARVEST' | 'GOAL_MILESTONE' | 'HEALTH_SCORE' | 'EMI_DUE'
  severity: 'INFO' | 'WARNING' | 'ACTION'
  message: string
  ctaPath: string       // e.g. "/allocation", "/portfolio"
}

interface RecentTransaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  merchant: string
  amountPaise: number
  date: string
  category: string
}
```

## State

- TanStack Query: `useDashboardQuery` — `GET /api/v1/dashboard`; stale time 2 min
- No local state beyond what widgets manage internally

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/dashboard` | Single aggregated endpoint for all widget data |

---

## Key Logic

- Dashboard endpoint aggregates from: `networth`, `income`, `expenses`, `allocation`, `fireProgress`, `alerts` — single DB round trip using Prisma `$transaction`
- Alert generation rules:
  - REBALANCE: any asset class drift > 5% → WARNING
  - LTCG_HARVEST: unrealized gains on equity > ₹1.25L and holding > 11 months → INFO
  - GOAL_MILESTONE: FIRE progress crosses 25/50/75/90% → INFO
  - HEALTH_SCORE: score drops > 10 points vs last month → WARNING
  - EMI_DUE: loan EMI date within 5 days → ACTION
- Sparkline: last 7 `NetWorthSnapshot` values (daily); pad with null if < 7 records
- Grid layout: 2-col on mobile (375px), 3-col at md, 4-col at xl

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/dashboard` | `DashboardPage` | Protected; default route after login |

---

## Acceptance Criteria

- [ ] All 6 widgets render with real data (not placeholders)
- [ ] AlertsPanel shows 0–N alerts with severity color-coding; empty state if none
- [ ] Net worth sparkline renders correctly (7 points)
- [ ] Savings rate ring shows correct % for current month
- [ ] Allocation drift badge appears on AllocationWidget when drift > 5%
- [ ] FIRE progress bar reflects actual corpus vs target
- [ ] Recent transactions shows last 5 entries with correct icons
- [ ] Dashboard API uses `$transaction` for single DB round trip
- [ ] Responsive at 375px / 768px / 1280px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Consolidated Dashboard API per `specs/18-consolidated-dashboard.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Single `GET /api/v1/dashboard` endpoint using Prisma `$transaction` to aggregate: net worth snapshot, current month cash flow, allocation drift, FIRE progress, active alerts (5 rule types), and last 5 transactions.

## /fe Prompt

> Build the Consolidated Dashboard UI per `specs/18-consolidated-dashboard.md`. Stack: React 18 + Vite + TypeScript + Tailwind + Recharts + TanStack Query. Replace existing `/dashboard` placeholder. 6 widgets in responsive CSS grid (2→3→4 col). Sparkline via Recharts LineChart. Savings rate via RadialBarChart. AlertsPanel with severity colors.
