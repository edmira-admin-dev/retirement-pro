# 01 — Portfolio Ledger

**Goal:** CRUD interface for multi-asset holdings backed by the API, with net worth summary and asset class breakdown.

**Depends on:** 00-foundation.md

---

## User Story

As an Indian professional, I want to record all my investments (MF, NPS, EPF, PPF, Stocks) in one place and have them persist across devices.

---

## Screens / Components

- `PortfolioPage` — full page, hosts all sections
- `AssetClassTabs` — tab switcher: All | MF | NPS | EPF/PPF | Stocks
- `AssetEntryForm` — add/edit drawer form for a single holding
- `HoldingCard` — name, current value, gain/loss %, asset class badge, edit/delete actions
- `NetWorthSummary` — total across all holdings + donut chart (Recharts `PieChart`)
- `AssetClassBadge` — colored pill per regulator: SEBI | PFRDA | EPFO | Direct

---

## Data Shape

```typescript
type AssetClass = 'MF' | 'NPS' | 'EPF' | 'PPF' | 'STOCK'

interface Holding {
  id: string
  name: string
  assetClass: AssetClass
  currentValue: number    // ₹ (frontend divides paise from API by 100)
  investedValue: number
  units?: number
  nav?: number
  notes?: string
  lastUpdated: string     // ISO
}

type HoldingInput = Omit<Holding, 'id' | 'lastUpdated'>
```

## State

- TanStack Query: `useHoldings()` → `GET /holdings`
- Mutations: `useAddHolding()`, `useUpdateHolding()`, `useDeleteHolding()`
- All mutations invalidate `['holdings']` query on success
- Zustand (UI only): `usePortfolioUIStore` — `drawerOpen: boolean`, `editingId: string | null`
- **No localStorage** — server is source of truth

---

## API Calls

| Hook | Method | Endpoint |
|------|--------|----------|
| `useHoldings` | GET | `/holdings` |
| `useAddHolding` | POST | `/holdings` |
| `useUpdateHolding` | PATCH | `/holdings/:id` |
| `useDeleteHolding` | DELETE | `/holdings/:id` |

**Paise conversion:** multiply by 100 before POST/PATCH; divide by 100 after GET.

---

## Key Logic

- Gain/loss % = `((currentValue - investedValue) / investedValue) * 100`
- Net worth = sum of all `currentValue`
- EPF/PPF: `units` and `nav` fields hidden in form
- `lastUpdated` set server-side on create/update; displayed as "Updated X days ago"

---

## Routes

| Path | Component |
|------|-----------|
| `/portfolio` | `PortfolioPage` |

---

## Acceptance Criteria

- [ ] Holdings load from API on page mount
- [ ] Add/edit/delete persists to DB and reflects immediately (optimistic update)
- [ ] Net worth and donut chart update reactively
- [ ] Paise ↔ ₹ conversion is transparent to the user
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Portfolio Ledger per `specs/01-portfolio-ledger.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + TanStack Query + Axios. All data via REST API. Convert paise to ₹ on read, ₹ to paise on write. Dark fintech theme.
