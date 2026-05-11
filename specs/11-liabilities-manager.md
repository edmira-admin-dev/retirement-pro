# 11 — Liabilities Manager

**Goal:** Track all loans and credit card debt — outstanding principal, EMI, interest cost, and payoff timeline — so liabilities are reflected in net worth.

**Depends on:** 00-backend.md, 00-foundation.md

---

## User Story

As a user, I want to log all my loans with their outstanding balances and interest rates so my net worth calculation is accurate and I can see total debt at a glance.

---

## Screens / Components

- `LiabilitiesPage` — list of all loans with summary header
- `LoanCard` — per-loan card: name, outstanding, EMI, rate, months remaining, progress bar
- `LoanForm` — modal: loan type, lender, principal, outstanding, interest rate, EMI, start date, end date
- `LiabilitiesStats` — total outstanding debt, total monthly EMI burden, weighted avg interest rate

---

## Data Shape

```typescript
type LoanType = 'HOME' | 'AUTO' | 'PERSONAL' | 'EDUCATION' | 'CREDIT_CARD' | 'OTHER'

interface Loan {
  id: string
  userId: string
  name: string                    // "HDFC Home Loan"
  type: LoanType
  lender: string
  principalPaise: number          // original loan amount
  outstandingPaise: number        // current outstanding principal
  interestRateBps: number         // annual rate in basis points (e.g. 875 = 8.75%)
  emiPaise: number                // monthly EMI
  startDate: string               // YYYY-MM-DD
  endDate: string                 // YYYY-MM-DD (expected payoff)
  active: boolean
  createdAt: string
}
```

## State

- TanStack Query: `useLoansQuery` — `GET /api/v1/liabilities`
- TanStack Query: `useLoanMutation` — POST/PATCH/DELETE
- On mutation: invalidate `liabilities`, `networth` query keys

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/liabilities` | List all loans for user |
| POST | `/api/v1/liabilities` | Add loan |
| PATCH | `/api/v1/liabilities/:id` | Update (supports partial — e.g. update outstanding after prepayment) |
| DELETE | `/api/v1/liabilities/:id` | Remove loan |

---

## Key Logic

- Interest rate display: `interestRateBps / 100` → "8.75% p.a."
- Months remaining: `Math.ceil((endDate - today) / 30)`
- Progress bar: `1 - (outstandingPaise / principalPaise)` = repayment progress
- Total monthly EMI burden: `Σ emiPaise` for active loans / 100
- Weighted avg interest rate: `Σ(outstandingPaise × interestRateBps) / Σ(outstandingPaise)`
- Total interest remaining (approx): `outstandingPaise × (interestRateBps/10000) × (monthsRemaining/12)`
- Net worth impact: `Σ outstandingPaise` subtracted from gross assets

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/liabilities` | `LiabilitiesPage` | Protected |

---

## Acceptance Criteria

- [ ] Add/edit/delete loans with all fields
- [ ] LoanCard progress bar reflects outstanding vs original principal
- [ ] Interest rate stored as bps, displayed as %
- [ ] Total EMI burden and weighted avg rate shown in stats header
- [ ] Inactive loans (paid off) can be archived and hidden from default view
- [ ] Net worth query key invalidated on mutation
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Liabilities Manager API per `specs/11-liabilities-manager.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Add `Loan` model; implement 4 REST endpoints with JWT auth. Interest rate stored as basis points integer. Outstanding amount in paise.

## /fe Prompt

> Build the Liabilities Manager UI per `specs/11-liabilities-manager.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/liabilities`. LoanCard with repayment progress bar. Invalidate `networth` query key on mutation.
