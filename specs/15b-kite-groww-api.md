# 15b — Kite + Groww API Sync

**Goal:** Sync trade history from Zerodha Kite and Groww into the trading journal using MCP tools, with duplicate detection and preview before commit.

**Depends on:** 15-broker-hub.md

---

## User Story

As a Kite or Groww user, I want to connect and sync my executed trades so my journal stays current without manual entry.

---

## Screens / Components

- `KiteSyncPage` — route `/trading/kite`; connection status, sync button, last synced, sync result
- `GrowwSyncPage` — route `/trading/groww`; same layout
- `SyncPreviewTable` — shared: tabbed Holdings | Trades; checkboxes per row; Confirm button
- `SyncResultSummary` — synced count, duplicates skipped, errors

---

## Data Shape

```typescript
interface SyncPreviewItem {
  symbol: string
  exchange: string
  tradeDate: string       // YYYY-MM-DD
  transactionType: 'BUY' | 'SELL'
  quantity: number
  pricePaise: number      // price × 100
  isDuplicate: boolean
}

interface SyncResult {
  tradesSynced: number
  duplicatesSkipped: number
  errors: string[]
}
```

## State

- TanStack Query: `useKiteStatusQuery` — `GET /api/v1/integrations` (filter broker=KITE)
- TanStack Query mutation: `useKiteSyncMutation` — `POST /api/v1/integrations/kite/sync`
- TanStack Query mutation: `useKitePreviewMutation` — `POST /api/v1/integrations/kite/sync/preview`
- Same pattern for Groww (`groww` slug)
- Local state: `syncStep: 'idle' | 'fetching' | 'reviewing' | 'committing'`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/integrations/kite/sync/preview` | Fetch via MCP, return preview rows without committing |
| POST | `/api/v1/integrations/kite/sync` | Commit synced trades to trading journal |
| POST | `/api/v1/integrations/groww/sync/preview` | Same for Groww |
| POST | `/api/v1/integrations/groww/sync` | Same for Groww |

---

## MCP Tools Used

**Kite:** `mcp__claude_ai_kite__get_trades` → executed trades, `mcp__claude_ai_kite__get_orders` (filter `status=COMPLETE`), `mcp__claude_ai_kite__get_profile` (session verify)

**Groww:** `mcp__claude_ai_GrowwMCP__authenticate` → session, then available trade/holdings tools

---

## Key Logic

- **Session check**: call `get_profile` (Kite) or `authenticate` (Groww); if fails → return 401 with `sessionExpired: true` → frontend shows "Re-login via `! kite login`"
- **Duplicate detection**: skip if `userId + symbol + tradeDate + quantity + pricePaise` already in `Trade` table
- **Price normalization**: broker returns price as float → `Math.round(price × 100)` → paise
- **Trade upsert**: insert with `importedFrom: 'KITE'` or `'GROWW'`, `broker: 'KITE'|'GROWW'`
- **After commit**: invalidate TanStack Query keys: `['trades']`, `['networth']`, `['integrations']`
- **BrokerConnection update**: set `lastSyncedAt`, `tradesSynced`, `duplicatesSkipped`, `status: 'CONNECTED'` on success; `status: 'ERROR'` on failure

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading/kite` | `KiteSyncPage` | Protected |
| `/trading/groww` | `GrowwSyncPage` | Protected |

---

## Acceptance Criteria

- [ ] Preview shows parsed trades before commit; user can deselect rows
- [ ] Duplicate trades skipped; count shown in summary
- [ ] Expired session shows re-login prompt, not a generic error
- [ ] BrokerConnection `lastSyncedAt` updated after successful sync
- [ ] Kite and Groww sync flows work independently
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build Kite + Groww API sync per `specs/15b-kite-groww-api.md`. Stack: Node + Express + TypeScript + Prisma. Use MCP tools `mcp__claude_ai_kite__get_trades` and `mcp__claude_ai_GrowwMCP__*` to fetch trades. Normalize to paise, deduplicate by userId+symbol+tradeDate+qty+price, batch insert into Trade table with broker/importedFrom fields. Update BrokerConnection after sync.

## /fe Prompt

> Build Kite + Groww sync pages per `specs/15b-kite-groww-api.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Routes `/trading/kite` and `/trading/groww`. Preview table with checkboxes, 4-step sync flow (idle → fetching → reviewing → committing). Show session-expired prompt with re-login instruction.
