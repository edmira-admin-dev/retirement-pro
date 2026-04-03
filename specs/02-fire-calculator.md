# 02 — FIRE Calculator

**Goal:** Compute target retirement corpus with Indian SWR rules; persist inputs to server so they survive sessions.

**Depends on:** 01-portfolio-ledger.md

---

## User Story

As a FIRE aspirant, I want to calculate my target corpus using conservative Indian-specific rates and have my inputs saved so I don't re-enter them each session.

---

## Screens / Components

- `CalculatorPage` — two-column layout: inputs left, results right (stacked on mobile)
- `InputPanel` — labeled sliders + number fields for all inputs
- `ResultPanel` — target corpus, shortfall/surplus, monthly SIP, healthcare reserve callout
- `InflationBreakdown` — expandable: expense categories with applied inflation rates
- `CorpusGauge` — radial progress: current portfolio vs target corpus (Recharts `RadialBarChart`)

---

## Data Shape

```typescript
interface FireInputs {
  currentAge: number
  retirementAge: number           // default 45
  lifeExpectancy: number          // default 90
  currentMonthlyExpense: number   // ₹
  medicalMonthlyExpense: number   // ₹
  lifestyleBuffer: number         // % extra inflation 0–5
  expectedReturnPre: number       // % pa, default 12
  expectedReturnPost: number      // % pa, default 8
}

interface FireResult {            // computed client-side, not stored
  yearsToRetirement: number
  targetCorpus: number
  firstYearExpense: number
  shortfallOrSurplus: number
  monthlySipRequired: number
  healthcareReserve: number       // fixed ₹60L recommendation
}
```

## State

- TanStack Query: `useFireProfile()` → `GET /fire`; `useSaveFireProfile()` → `PUT /fire`
- Auto-save inputs on blur (debounced 800ms) — no explicit save button
- `currentPortfolioValue` derived from `useHoldings()` data (sum of currentValue)
- `FireResult` computed entirely client-side from inputs; never sent to server
- Zustand (UI only): `useFireUIStore` — `inflationExpanded: boolean`

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useFireProfile` | GET | `/fire` |
| `useSaveFireProfile` | PUT | `/fire` |

Paise conversion applies to all monetary fields.

---

## Key Logic

- `FV_general = monthlyExpense * 12 * (1.06)^yearsToRetirement`
- `FV_medical = medicalExpense * 12 * (1.12)^yearsToRetirement`
- `firstYearExpense = FV_general + FV_medical * (1 + lifestyleBuffer/100)`
- `realReturn = ((1 + postReturn/100) / 1.06) - 1`
- `targetCorpus = firstYearExpense * ((1 - (1+realReturn)^-retirementYears) / realReturn)`
- LTCG drag: `effectiveCorpus = targetCorpus / (1 - 0.125 * 0.30)`
- `SIP = (effectiveCorpus - currentPortfolio) * r / ((1+r)^n - 1)` where `r = monthlyRate`, `n = monthsToRetirement`
- If `currentPortfolio >= effectiveCorpus`: SIP = 0, show "FIRE Achieved" state

---

## Routes

| Path | Component |
|------|-----------|
| `/calculator` | `CalculatorPage` |

---

## Acceptance Criteria

- [ ] Inputs auto-save to API on blur
- [ ] Inputs restored from API on page load
- [ ] `currentPortfolioValue` derived from holdings API — no manual entry
- [ ] All formulas produce correct output (verify with: age 30, retire 45, expense ₹50k/m, portfolio ₹0)
- [ ] "FIRE Achieved" state shown when portfolio ≥ target
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the FIRE Calculator per `specs/02-fire-calculator.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + TanStack Query + Axios. Inputs auto-save to API. Math is purely client-side. Dark fintech theme.
