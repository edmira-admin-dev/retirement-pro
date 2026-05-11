# 09 — Expense Tracker

**Goal:** Log and categorize all expenses by type (Fixed / Discretionary / Loan) with a grouped inline entry grid, search, filter, and monthly breakdown — no popups.

**Depends on:** 00-backend.md, 00-foundation.md

---

## User Story

As a user, I want to record every expense directly in a grouped category grid without opening a popup, so I can enter amounts as fast as filling a spreadsheet and still see my committed vs flexible spending by type.

---

## Screens / Components

- `ExpensePage` — orchestrator: month nav + stats + quick-entry grid + list
- `QuickEntryGrid` — 3-column card layout (Fixed | Discretionary | Loan); each column lists category rows with inline amount input; pressing Enter saves instantly
- `InlineExpenseRow` — single category row: icon + label + collapsed amount field; clicking expands to show merchant + date inline (no modal)
- `ExpenseStats` — 4 summary stat cards: total, fixed, discretionary, loan (keep existing)
- `ExpenseList` — sortable table + mobile card layout + search; used below the grid to show logged records (keep existing, remove "Add Expense" FAB)
- `CategoryBreakdown` — donut chart (3 type segments), click-to-drill (keep existing)
- `ExpenseEditModal` — modal kept **only** for editing existing records (not for adding)

---

## Layout

```
┌─────────────────────────────────────────────┐
│  Expense Tracker          ← May 2026 →      │
├─────────────────────────────────────────────┤
│  [Total ₹X] [Fixed ₹X] [Disc. ₹X] [Loan ₹X]│  ← ExpenseStats (row of 4 cards)
├────────────────────────────────────────────────────────────────┤
│  FIXED (blue)          │ DISCRETIONARY (amber) │ LOAN (purple) │
│  ─────────────         │ ──────────────────    │ ───────────   │
│  Rent       [₹ _____]  │ Food        [₹ _____] │ Home EMI [...] │
│  Electricity[₹ _____]  │ Transport   [₹ _____] │ Car EMI  [...] │
│  Grocery    [₹ _____]  │ Shopping    [₹ _____] │ ...           │
│  ...                   │ ...                   │               │
│  [+ Add Fixed]         │ [+ Add Discretionary] │ [+ Add Loan]  │
├─────────────────────────────────────────────┤
│  CategoryBreakdown (donut)                  │
├─────────────────────────────────────────────┤
│  [Search…]             date ↕  amount ↕     │
│  ExpenseList (table / mobile cards)         │
└─────────────────────────────────────────────┘
```

---

## Data Shape

```typescript
type ExpenseType = 'FIXED' | 'DISCRETIONARY' | 'LOAN'

type FixedCategory =
  | 'RENT' | 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET'
  | 'GROCERY' | 'COOK' | 'DRIVER' | 'MAID' | 'INSURANCE'
  | 'SUBSCRIPTIONS' | 'FIXED_OTHER'

type DiscretionaryCategory =
  | 'FOOD' | 'TRANSPORT' | 'HEALTHCARE' | 'ENTERTAINMENT'
  | 'SHOPPING' | 'EDUCATION' | 'TRAVEL' | 'INVESTMENT'
  | 'DISC_OTHER'

type LoanCategory =
  | 'HOME_LOAN_EMI' | 'CAR_LOAN_EMI' | 'PERSONAL_LOAN_EMI'
  | 'EDUCATION_LOAN_EMI' | 'CREDIT_CARD_EMI' | 'LOAN_OTHER'

type ExpenseCategory = FixedCategory | DiscretionaryCategory | LoanCategory

interface ExpenseRecord {
  id: string
  userId: string
  merchant: string
  amountPaise: number
  expenseType: ExpenseType
  category: ExpenseCategory
  date: string                    // ISO YYYY-MM-DD
  recurring: boolean
  notes: string | null
  importedFrom: 'MANUAL' | 'CSV' | null
  createdAt: string
}
```

---

## State

- TanStack Query: `useExpenses` — `GET /api/v1/expenses?month=YYYY-MM&type=&category=&q=`
- TanStack Query: `useExpenseSummary` — `GET /api/v1/expenses/summary?month=YYYY-MM`
- TanStack Query: `useAddExpense` — `POST /api/v1/expenses`
- TanStack Query: `useUpdateExpense` — `PATCH /api/v1/expenses/:id`
- TanStack Query: `useDeleteExpense` — `DELETE /api/v1/expenses/:id`
- Local: `month: string` (YYYY-MM) in `ExpensePage`
- Local: `expandedRow: string | null` — which `InlineExpenseRow` is expanded (category key)
- On mutation: invalidate `expenses`, `networth`, `cashflow` query keys

---

## API Endpoints (Backend — unchanged)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/expenses` | List; query: `?month=YYYY-MM&type=&category=&q=` |
| POST | `/api/v1/expenses` | Create (single object or array) |
| PATCH | `/api/v1/expenses/:id` | Update |
| DELETE | `/api/v1/expenses/:id` | Delete |
| GET | `/api/v1/expenses/summary` | Monthly totals by expenseType and by category |

---

## Key Logic

### QuickEntryGrid

- 3 cards side by side on `lg:`, stacked on mobile
- Fixed card: blue accent (`border-blue-200 bg-blue-50/40` light or `border-blue-800/40 bg-blue-900/20` dark)
- Discretionary card: amber accent
- Loan card: purple accent
- Each card header shows: type label + monthly subtotal from `useExpenseSummary`
- Category rows sorted: most-used categories first (Rent, Grocery → top of Fixed; Food, Transport → top of Disc.)

### InlineExpenseRow (collapsed state)

- Row: `[icon] [Category Label]   [₹ ______]`
- Amount field: right-aligned, monospace, placeholder `0`
- Pressing Enter with a positive amount: saves immediately as `{ merchant: CAT_LABELS[category], category, expenseType, amountPaise, date: today, recurring: false }`
- After save: field clears, brief green flash on row
- If existing record for same category+date already logged this month: shows the total beside the label as a grey badge

### InlineExpenseRow (expanded state — click row label or pencil icon)

- Slides open inline (no modal) below the collapsed row
- Shows: Merchant input + Date picker + Recurring toggle + Notes (optional)
- Save / Cancel buttons inline
- Dismiss by pressing Escape or clicking Cancel

### "Add Fixed / Discretionary / Loan" footer button in each card

- Opens an expanded form at the bottom of that card's list (not a modal)
- Pre-selects the card's `expenseType`; shows category dropdown scoped to that type
- Saves and collapses on success

### ExpenseList (below grid)

- Remove "Add Expense" button from this section
- Edit pencil still opens `ExpenseEditModal` (existing modal, kept for edit-only)
- Delete confirmation inline (existing pattern)

### Mobile layout (≤ 767px)

- QuickEntryGrid: tabs (Fixed | Disc. | Loan) switch which card is visible — one card at a time
- Each card scrollable vertically; row height ≥ 48px

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/expenses` | `ExpensePage` | Protected |

---

## Acceptance Criteria

- [ ] QuickEntryGrid renders 3 grouped columns (Fixed / Discretionary / Loan) each with full category list
- [ ] Typing amount + Enter in any row saves instantly — no modal
- [ ] Row flashes green briefly after successful save
- [ ] Collapsed row shows monthly category total badge when ≥1 record exists
- [ ] Expanding a row shows merchant/date/recurring fields inline without any modal overlay
- [ ] "Add [Type]" footer button opens inline form within the card (no popup)
- [ ] `ExpenseEditModal` only appears when editing an existing record from `ExpenseList`
- [ ] `ExpenseStats` shows 4 cards: total, fixed, discretionary, loan from summary endpoint
- [ ] `CategoryBreakdown` donut shows 3 segments; click drills into categories
- [ ] Month selector changes dataset across all components
- [ ] Mobile: tab switcher shows one column at a time
- [ ] Search in `ExpenseList` debounced 300ms
- [ ] On mutation: `expenses`, `networth`, `cashflow` queries invalidated
- [ ] Mobile-responsive at 375px — no horizontal scroll
- [ ] No TypeScript errors

---

## /fe Prompt

> Rewrite the Expense Tracker UI per `specs/09-expense-tracker.md`. The primary change: **replace the add-expense popup modal with an inline `QuickEntryGrid`** — 3 side-by-side cards (Fixed / Discretionary / Loan), each listing category rows where the user types an amount and presses Enter to save instantly. Keep `ExpenseStats`, `CategoryBreakdown`, `ExpenseList` (existing), and `ExpenseEditModal` (edit-only). Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query + Recharts. Invalidate `expenses`, `networth`, `cashflow` on mutation.
