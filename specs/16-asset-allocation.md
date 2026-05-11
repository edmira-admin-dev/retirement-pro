# 16 — Asset Allocation & Rebalancing

**Goal:** Set a target allocation across asset classes, detect when current allocation drifts beyond ±5%, and generate tax-aware rebalancing action items.

**Depends on:** 01-portfolio-ledger.md, 14-trading-journal.md

---

## User Story

As an investor, I want to set a target allocation (e.g. 60% equity / 30% debt / 10% gold) and get alerted when my portfolio drifts too far, with specific buy/sell actions to rebalance.

---

## Screens / Components

- `AllocationPage` — split view: Current Allocation (left) + Target Setup + Recommendations (right)
- `AllocationDonutChart` — current allocation by asset class (color-coded)
- `AllocationTargetSliders` — slider per asset class summing to 100%; live validation
- `DriftTable` — per asset class: target %, current %, drift %, status (OK / OVERWEIGHT / UNDERWEIGHT)
- `RebalanceActions` — ordered list of buy/sell actions with amounts; tax impact estimate

---

## Data Shape

```typescript
type AssetClass = 'EQUITY' | 'DEBT' | 'GOLD' | 'REAL_ESTATE' | 'CASH' | 'INTERNATIONAL'

interface AllocationTarget {
  id: string
  userId: string
  targets: Record<AssetClass, number>   // percentage, sums to 100
  updatedAt: string
}

interface AllocationAnalysis {
  totalPortfolioPaise: number
  current: Record<AssetClass, { valuePaise: number; pct: number }>
  target: Record<AssetClass, number>    // pct
  drift: Record<AssetClass, { driftPct: number; status: 'OK' | 'OVERWEIGHT' | 'UNDERWEIGHT' }>
  rebalanceActions: RebalanceAction[]
}

interface RebalanceAction {
  assetClass: AssetClass
  action: 'BUY' | 'SELL'
  amountPaise: number
  reason: string
  taxNote: string | null    // e.g. "Selling LTCG eligible (>1Y held); tax impact ~₹2,340"
}
```

## State

- TanStack Query: `useAllocationQuery` — `GET /api/v1/allocation`
- TanStack Query: `useAllocationTargetMutation` — `PUT /api/v1/allocation/target`
- Local state: `AllocationPage` — draft target sliders before save

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/allocation` | Current allocation + drift + rebalance actions |
| PUT | `/api/v1/allocation/target` | Save target allocation percentages |

---

## Key Logic

- Asset class mapping from holdings:
  - `MF_EQUITY`, `STOCKS` → EQUITY
  - `MF_DEBT`, `PPF`, `EPF`, `FD` → DEBT
  - `GOLD`, `SGB` → GOLD
  - `REAL_ESTATE` → REAL_ESTATE
  - `CASH`, bank accounts → CASH
- Drift threshold: alert when `|currentPct − targetPct| > 5`
- Rebalance amount: `(targetPct − currentPct) × totalPortfolioPaise / 100`
  - Positive → BUY; negative → SELL
- Tax-aware SELL preference: check holding `purchaseDate`; prefer selling holdings held >365 days (LTCG rate 12.5% on gains >₹1.25L) over STCG holdings (20%)
- LTCG estimate: `(currentValuePaise − purchasePricePaise) × 0.125` if held >365 days
- Rebalance action order: sell overweights before buy underweights (minimize cash drag)
- Slider validation: sum must equal exactly 100; prevent save otherwise

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/allocation` | `AllocationPage` | Protected |

---

## Acceptance Criteria

- [ ] Target sliders: 6 asset classes, sum-to-100 validation
- [ ] Drift table shows OK (green) / OVERWEIGHT (amber) / UNDERWEIGHT (red) per class
- [ ] Rebalance actions list with buy/sell amounts in ₹
- [ ] Tax note appears for SELL actions on eligible holdings
- [ ] Donut chart updates when target is saved
- [ ] Alert banner on any page if drift >5% in any class (badge on sidebar nav item)
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Asset Allocation API per `specs/16-asset-allocation.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Map holdings to 6 asset classes; calculate drift vs stored target; generate tax-aware rebalance actions (prefer selling LTCG-eligible holdings). Store `AllocationTarget` in DB.

## /fe Prompt

> Build the Asset Allocation UI per `specs/16-asset-allocation.md`. Stack: React 18 + Vite + TypeScript + Tailwind + Recharts + TanStack Query. Route `/allocation`. Donut chart for current allocation; sliders that sum to 100; drift table with color-coded status; rebalance action list with tax notes.
