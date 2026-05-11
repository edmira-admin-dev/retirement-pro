# 15 — Kite Broker Integration

**Goal:** Connect Zerodha Kite account to sync holdings, positions, and order history into the trading journal and portfolio ledger.

**Depends on:** 14-trading-journal.md, 01-portfolio-ledger.md

---

## User Story

As a Zerodha user, I want to connect my Kite account so my trades and holdings sync automatically instead of manual entry.

---

## Screens / Components

- `KiteConnectPage` — connection status, connect/disconnect button, last synced timestamp
- `KiteSyncPreview` — tabbed: Holdings | Positions | Orders — shows what will be imported before confirmation
- `KiteSyncStatus` — in-progress indicator with per-category counts (synced / skipped / errors)

---

## Data Shape

```typescript
interface KiteConnection {
  connected: boolean
  lastSyncedAt: string | null
  syncSummary: {
    holdingsSynced: number
    tradesSynced: number
    duplicatesSkipped: number
  } | null
}

interface KiteSyncResult {
  holdings: { synced: number; skipped: number }
  trades: { synced: number; skipped: number }
  errors: string[]
}
```

## State

- TanStack Query: `useKiteConnectionQuery` — `GET /api/v1/integrations/kite/status`
- TanStack Query: `useKiteSyncMutation` — `POST /api/v1/integrations/kite/sync`
- Local state: `KiteConnectPage` — `syncStep`: `'idle' | 'fetching' | 'reviewing' | 'committing'`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/integrations/kite/status` | Connection status + last sync summary |
| POST | `/api/v1/integrations/kite/sync` | Trigger full sync (holdings + trades) |
| POST | `/api/v1/integrations/kite/sync/preview` | Fetch Kite data, return preview without committing |

---

## Kite API Calls (via MCP tools on backend)

| Kite Tool | Data Fetched | Maps To |
|-----------|-------------|---------|
| `get_holdings` | Long-term demat holdings | Portfolio ledger (`/holdings`) |
| `get_positions` | Intraday/overnight open positions | Trading journal (`/trades/positions`) |
| `get_orders` | Today's executed orders | Trading journal (`/trades`) batch insert |
| `get_profile` | User identity verification | Confirm account match |

---

## Key Logic

- Kite session: user must be logged into Kite; backend uses MCP tools to fetch data
- Duplicate detection: skip trades where same `date + symbol + qty + price` already exists (`importedFrom = 'KITE'` or `'MANUAL'`)
- Holdings sync: upsert portfolio ledger records by `symbol + exchange`; update `currentValuePaise = quantity × lastPrice × 100`
- Positions from `get_positions`: only carry-forward positions (not intraday) inserted as open trades
- Orders from `get_orders`: only `COMPLETE` status; batch POST to `/api/v1/trades`
- After sync: invalidate `holdings`, `trades`, `positions`, `networth` query keys

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading/kite` | `KiteConnectPage` | Protected |

---

## Acceptance Criteria

- [ ] Connect flow: fetch profile to verify Kite session → show sync preview
- [ ] Holdings sync upserts portfolio ledger without creating duplicates
- [ ] Orders sync batch-inserts to trading journal with `importedFrom: 'KITE'`
- [ ] Duplicate orders skipped; count shown in sync summary
- [ ] Last synced timestamp shown on connection page
- [ ] Sync can be triggered manually; loading state shown
- [ ] Graceful error if Kite session expired (prompt to re-login via `! kite login`)
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Kite Integration API per `specs/15-kite-integration.md`. Stack: Node + Express + TypeScript + Prisma. Fetch data using Kite MCP tools (get_holdings, get_positions, get_orders, get_profile). Upsert holdings into portfolio ledger; batch-insert unique trades into trading journal. Duplicate detection by symbol+date+qty+price.

## /fe Prompt

> Build the Kite Integration UI per `specs/15-kite-integration.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/trading/kite`. Sync preview tabbed view (Holdings | Positions | Orders). Progress indicator during sync. Invalidate `holdings`, `trades`, `networth` after successful sync.
