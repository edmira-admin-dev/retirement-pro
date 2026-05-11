# 14 — Trading Journal

**Goal:** Manual trade log for stocks and F&O on NSE/BSE with FIFO P&L, open positions view, and realized/unrealized breakdown.

**Depends on:** 00-backend.md, 00-foundation.md

---

## User Story

As a trader, I want to log every buy/sell trade and see my realized P&L and current open positions so I can track trading performance independently of my long-term portfolio.

---

## Screens / Components

- `TradingPage` — tabbed: Open Positions | Trade History | P&L Summary
- `PositionsTable` — open positions: symbol, qty, avg buy price, LTP (manual), unrealized P&L
- `TradeHistoryTable` — all trades, filterable by symbol/segment/date range
- `TradeForm` — modal: symbol, exchange, segment, type (BUY/SELL), qty, price, date, brokerage, notes
- `PnLSummaryCards` — realized P&L (period), unrealized P&L (current), total brokerage paid

---

## Data Shape

```typescript
type Exchange = 'NSE' | 'BSE'
type Segment = 'EQ' | 'FO' | 'CDS' | 'MF'
type TradeType = 'BUY' | 'SELL'

interface Trade {
  id: string
  userId: string
  symbol: string           // "RELIANCE", "NIFTY24DECFUT"
  exchange: Exchange
  segment: Segment
  tradeType: TradeType
  quantity: number
  pricePaise: number       // per unit in paise
  date: string             // YYYY-MM-DD
  brokeragePaise: number   // total brokerage + taxes for this trade
  notes: string | null
  importedFrom: 'MANUAL' | 'KITE' | null
  createdAt: string
}

interface Position {
  symbol: string
  exchange: Exchange
  segment: Segment
  netQty: number           // positive = long, negative = short
  avgBuyPricePaise: number // FIFO cost basis
  ltpPaise: number         // last entered manually or synced from Kite
  unrealizedPnlPaise: number
}
```

## State

- TanStack Query: `useTradesQuery` — `GET /api/v1/trades`
- TanStack Query: `usePositionsQuery` — `GET /api/v1/trades/positions`
- TanStack Query: `usePnlSummaryQuery` — `GET /api/v1/trades/pnl`
- Local state: `TradeForm` — form fields

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/trades` | List trades; query: `?symbol=&segment=&from=&to=` |
| POST | `/api/v1/trades` | Log trade (single or batch array for Kite import) |
| PATCH | `/api/v1/trades/:id` | Edit trade |
| DELETE | `/api/v1/trades/:id` | Delete trade |
| GET | `/api/v1/trades/positions` | Compute open positions (FIFO) |
| GET | `/api/v1/trades/pnl` | Realized P&L summary; query: `?from=&to=` |
| PATCH | `/api/v1/trades/positions/:symbol/ltp` | Update LTP for a symbol |

---

## Key Logic

- FIFO cost basis: earliest BUY lots consumed first when a SELL is logged
- `unrealizedPnlPaise = (ltpPaise − avgBuyPricePaise) × netQty`
- `realizedPnlPaise`: for each SELL lot matched to a BUY → `(sellPrice − buyPrice) × matchedQty − brokeragePaise`
- `netQty`: sum of (BUY qty) − sum of (SELL qty) per symbol; netQty = 0 → position closed
- Closed positions are excluded from `/positions` but count in `/pnl`
- STT, exchange charges, GST included in `brokeragePaise` (user enters total)

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading` | `TradingPage` | Protected |

---

## Acceptance Criteria

- [ ] Add/edit/delete trades; batch POST works (used by Kite sync)
- [ ] Open positions calculated with correct FIFO logic
- [ ] LTP can be updated per symbol; unrealized P&L recalculates
- [ ] Realized P&L filters by date range
- [ ] Trade history filterable by symbol, segment, date
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Trading Journal API per `specs/14-trading-journal.md`. Stack: Node + Express + TypeScript + Prisma + MySQL. FIFO cost basis calculation server-side. Batch POST for Kite import. Positions and P&L computed endpoints.

## /fe Prompt

> Build the Trading Journal UI per `specs/14-trading-journal.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/trading`. Tabbed layout: Open Positions | Trade History | P&L Summary. LTP editable inline in positions table.
