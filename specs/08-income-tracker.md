# 08 — Income Tracker

**Goal:** Track all income sources (salary, freelance, rental, dividends, business) with recurring patterns and monthly aggregation.

**Depends on:** 00-backend.md, 00-foundation.md

---

## User Story

As a user, I want to log every income source and see my total monthly earnings so I can understand my cash inflow and calculate my savings rate.

---

## Screens / Components

- `IncomePage` — full-page list of income records with monthly total header
- `IncomeList` — sortable, filterable table of income entries
- `IncomeForm` — modal for add/edit with source, amount, date, category, recurring toggle
- `IncomeStats` — summary cards: monthly total, YTD total, primary source %, MoM change

---

## Data Shape

```typescript
type IncomeCategory = 'SALARY' | 'FREELANCE' | 'RENTAL' | 'DIVIDEND' | 'BUSINESS' | 'INTEREST' | 'OTHER'
type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME'

interface IncomeRecord {
  id: string
  userId: string
  source: string           // "Infosys Ltd", "Flat 2B rent", etc.
  amountPaise: number      // stored as integer paise
  category: IncomeCategory
  date: string             // ISO date YYYY-MM-DD
  recurring: boolean
  frequency: RecurringFrequency
  notes: string | null
  createdAt: string
}
```

## State

- TanStack Query: `useIncomeQuery` — `GET /api/v1/income?month=YYYY-MM`
- TanStack Query: `useIncomeMutation` — POST/PATCH/DELETE `/api/v1/income`
- Local state: `IncomeForm` — form fields, open/close
- On mutation success: invalidate `income`, `networth`, `cashflow` query keys

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/income` | List records; query params: `?month=YYYY-MM&category=` |
| POST | `/api/v1/income` | Create record |
| PATCH | `/api/v1/income/:id` | Update record |
| DELETE | `/api/v1/income/:id` | Delete record |
| GET | `/api/v1/income/summary` | Monthly totals grouped by category |

---

## Key Logic

- Display amount: `amountPaise / 100` formatted as `₹1,23,456`
- Monthly total: sum of records where `date` falls within selected month
- YTD total: sum Jan 1 – today
- MoM change: `(thisMonth - lastMonth) / lastMonth × 100`
- Recurring entries are template records only — not auto-duplicated; user confirms each month

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/income` | `IncomePage` | Protected |

---

## Acceptance Criteria

- [ ] Add/edit/delete income records with all fields
- [ ] Month selector filters list and recalculates totals
- [ ] IncomeStats cards update on mutation
- [ ] Category filter works on list
- [ ] Amount stored as paise, displayed as ₹ with Indian number format
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Income Tracker API per `specs/08-income-tracker.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Add `IncomeRecord` Prisma model; implement 5 REST endpoints with JWT auth middleware. Money stored as paise (integer).

## /fe Prompt

> Build the Income Tracker UI per `specs/08-income-tracker.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query + Zustand. Route `/income`. Indian Rupee formatting (paise ÷ 100). Invalidate `networth` and `cashflow` query keys on mutation.
