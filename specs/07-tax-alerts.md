# 07 — Tax Alerts

**Goal:** Surface LTCG harvesting opportunities and 3-bucket allocation status from API-persisted tax inputs.

**Depends on:** 01-portfolio-ledger.md

---

## User Story

As an investor, I want alerts when my equity gains near the ₹1.25L LTCG limit and a view of my bucket allocation so I can act before year-end.

---

## Screens / Components

- `TaxAlertsSection` — section on `PortfolioPage` (below holdings list)
- `LtcgGauge` — horizontal bar: realized gains this FY vs ₹1.25L limit
- `HarvestingAlert` — warning card with remaining limit, urgency color, action guidance
- `BucketAllocationCard` — 3-bucket stacked bar: actual vs ideal allocation
- `GlideDownAlert` — warning banner when within 5 years of retirement

---

## Data Shape

```typescript
interface TaxInputs {
  realizedGainsFY: number         // ₹
  unrealizedEquityGains: number   // ₹
}

// Derived client-side
interface BucketAllocation {
  bucket1: number    // user-defined liquid (₹)
  bucket2: number    // EPF + PPF + NPS from holdings
  bucket3: number    // MF + STOCK from holdings
  total: number
}

interface BucketIdeal {
  bucket1: number    // 6 months of firstYearExpense/12
  bucket2: number    // 20% of targetCorpus
  bucket3: number    // remainder
}
```

## State

- TanStack Query: `useTaxProfile()` → `GET /tax`; `useSaveTaxProfile()` → `PUT /tax`
- Auto-save on blur (debounced 800ms)
- `BucketAllocation` derived from `useHoldings()` — asset class mapping:
  - Bucket 2: EPF + PPF + NPS holdings
  - Bucket 3: MF + STOCK holdings
  - Bucket 1: `total - bucket2 - bucket3` (residual, proxy for liquid)
- `BucketIdeal` derived from FIRE calculator results

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useTaxProfile` | GET | `/tax` |
| `useSaveTaxProfile` | PUT | `/tax` |

---

## Key Logic

**LTCG Harvesting:**
- `remaining = 125000 - realizedGainsFY`
- Alert visible if: `unrealizedEquityGains > remaining * 0.8`
- Alert message: "Book ₹{remaining} of profits before 31 March"
- Urgency: `currentMonth >= 11` (Feb = 11, Mar = 12 in 0-indexed) → red; else amber
- Hide alert if `realizedGainsFY >= 125000` (limit already hit)

**Glide-Down:**
- `yearsToRetirement = retirementAge - currentAge` (from fire profile)
- If `yearsToRetirement <= 5` → show: "Shift ₹{excess} from Bucket 3 → Bucket 2 to reduce sequence-of-returns risk"
- `excess = bucket3 - bucket3Ideal`

**Bucket bar:** stacked `BarChart` with two series per bucket (actual vs ideal), grouped

---

## Acceptance Criteria

- [ ] Tax inputs persist to API; restored on page load
- [ ] LTCG gauge shows correct remaining limit
- [ ] Harvesting alert changes color in Feb–March
- [ ] Alert hidden when `realizedGainsFY >= ₹1.25L`
- [ ] 3-bucket chart derives from holdings — no manual bucket entry
- [ ] Glide-down warning fires when within 5 years of retirement
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Tax Alerts feature per `specs/07-tax-alerts.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + TanStack Query + Axios. Tax inputs persist to API. Bucket allocation and glide-down derive from other queries. Dark fintech theme.
