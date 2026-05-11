# 13 — Net Worth Engine

**Goal:** Real-time net worth = total assets − total liabilities, with historical daily snapshots and a live recalculation whenever any underlying data changes.

**Depends on:** 01-portfolio-ledger.md, 08-income-tracker.md, 11-liabilities-manager.md

---

## User Story

As a user, I want to see my live net worth at any moment — and watch it update when I add a holding, log income, or record a loan repayment — so I always know exactly where I stand financially.

---

## Screens / Components

- `NetWorthPage` — hero number + breakdown + historical chart
- `NetWorthHero` — large ₹ figure, MoM change %, animated counter on mount
- `AssetBreakdown` — horizontal stacked bar: portfolio / real estate / cash vs loans
- `NetWorthHistoryChart` — area chart of daily snapshots (last 365 days)
- `NetWorthBreakdownTable` — line-item table: each asset bucket and each loan

---

## Data Shape

```typescript
interface NetWorthSnapshot {
  date: string              // YYYY-MM-DD
  totalAssetsPaise: number  // sum of all asset buckets
  totalLiabilitiesPaise: number
  netWorthPaise: number     // assets - liabilities
}

interface NetWorthDetail {
  current: NetWorthSnapshot
  assetBuckets: {
    portfolio: number      // sum of holdings current values (paise)
    cash: number           // manual cash/bank entries (paise)
    realEstate: number     // real estate holdings (paise)
  }
  liabilityBuckets: {
    loans: number          // sum of outstanding loan principals (paise)
  }
  history: NetWorthSnapshot[]  // last 365 daily snapshots
}
```

## State

- TanStack Query: `useNetWorthQuery` — `GET /api/v1/networth`; query key `['networth']`
- Invalidated by: mutations in `holdings`, `income`, `expenses`, `liabilities`
- Local state: `NetWorthPage` — `historyRange`: `'1M' | '3M' | '6M' | '1Y'`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/networth` | Current + breakdown + 365-day history |
| POST | `/api/v1/networth/snapshot` | Trigger manual snapshot save (also called by cron) |

---

## Key Logic

- `netWorthPaise = totalAssetsPaise − totalLiabilitiesPaise`
- `totalAssetsPaise = Σ(holdings.currentValuePaise) + cashPaise + realEstatePaise`
- `totalLiabilitiesPaise = Σ(loans.outstandingPaise)`
- History snapshots: saved daily at midnight via cron job (or on-demand POST)
- If no history exists: return single snapshot for today
- MoM change: compare today vs snapshot from 30 days ago
- Real estate and cash: use a separate `ManualAsset` model (type: CASH | REAL_ESTATE | OTHER)

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/networth` | `NetWorthPage` | Protected |

---

## Acceptance Criteria

- [ ] Hero displays live net worth; refreshes when mutation invalidates query key
- [ ] Asset vs liability breakdown stacked bar renders correctly
- [ ] History chart supports 1M / 3M / 6M / 1Y range selector
- [ ] MoM change % displayed with directional indicator (↑/↓)
- [ ] Manual assets (cash, real estate) can be added via a form on this page
- [ ] Snapshot endpoint upserts daily record (no duplicates for same date)
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Net Worth Engine API per `specs/13-networth-engine.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. Aggregate holdings + manual assets − loans into NetWorthDetail. Add `NetWorthSnapshot` and `ManualAsset` Prisma models. Daily snapshot upsert endpoint.

## /fe Prompt

> Build the Net Worth UI per `specs/13-networth-engine.md`. Stack: React 18 + Vite + TypeScript + Tailwind + Recharts + TanStack Query. Route `/networth`. Query key `['networth']` is invalidated by mutations across the app. AreaChart for history. Animated counter on hero number (count-up on mount).
