# 12 — Cash Flow Dashboard

**Goal:** Monthly income vs expense P&L with 12-month trend, category breakdown, and savings rate — the financial performance report for each month.

**Depends on:** 08-income-tracker.md, 09-expense-tracker.md

---

## User Story

As a user, I want to see how much I earned vs spent each month with a trend chart so I can track my savings rate and identify months where spending spiked.

---

## Screens / Components

- `CashFlowPage` — full-page dashboard
- `MonthSelector` — prev/next arrows + month-year display
- `CashFlowSummaryCards` — Income | Expenses | Net Surplus | Savings Rate
- `CashFlowBarChart` — 12-month grouped bar (income = green, expense = red)
- `SurplusLineOverlay` — net surplus line on same chart
- `IncomeBreakdown` — donut: income by category for selected month
- `ExpenseBreakdown` — donut: expense by category for selected month

---

## Data Shape

```typescript
interface MonthlySummary {
  month: string            // "YYYY-MM"
  totalIncomePaise: number
  totalExpensesPaise: number
  netSurplusPaise: number  // income - expenses
  savingsRatePct: number   // (income - expenses) / income × 100
  incomeByCategory: Record<IncomeCategory, number>    // paise
  expensesByCategory: Record<ExpenseCategory, number> // paise
}
```

## State

- TanStack Query: `useCashFlowQuery(month)` — `GET /api/v1/cashflow?month=YYYY-MM`
- TanStack Query: `useCashFlowTrendQuery` — `GET /api/v1/cashflow/trend?months=12`
- Local state: `CashFlowPage` — `selectedMonth` (default: current month)

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cashflow` | `MonthlySummary` for `?month=YYYY-MM` |
| GET | `/api/v1/cashflow/trend` | Array of `MonthlySummary` for last N months (default 12) |

---

## Key Logic

- `netSurplusPaise = totalIncomePaise − totalExpensesPaise`
- `savingsRatePct = (netSurplusPaise / totalIncomePaise) × 100`; cap at 100, floor at −999
- If `totalIncomePaise = 0`: `savingsRatePct = 0`
- Surplus card color: green if > 0, red if < 0, gray if = 0
- Chart bar color threshold: income bars always green-500, expense bars always red-400
- Trend endpoint aggregates income and expense tables server-side by month

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/cashflow` | `CashFlowPage` | Protected |

---

## Acceptance Criteria

- [ ] Summary cards update when month is changed
- [ ] 12-month grouped bar chart with surplus line overlay renders correctly
- [ ] Income and expense donut charts show category breakdown for selected month
- [ ] Savings rate card turns red when negative
- [ ] Empty months (no records) render zero bars, not errors
- [ ] Mobile-responsive at 375px (stacked layout, charts scroll horizontally)
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Cash Flow API per `specs/12-cashflow-dashboard.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Two endpoints: monthly summary (aggregate income+expense by month) and 12-month trend. Server-side aggregation via Prisma groupBy.

## /fe Prompt

> Build the Cash Flow Dashboard per `specs/12-cashflow-dashboard.md`. Stack: React 18 + Vite + TypeScript + Tailwind + Recharts + TanStack Query. Route `/cashflow`. Two Recharts components: ComposedChart (grouped bars + line) for trend, PieChart for category breakdown. Month selector with prev/next arrows.
