# 15 — Broker Integration Hub

**Goal:** Unified broker connection model — Prisma schema, connection management API, and hub UI showing all 4 supported brokers with status.

**Depends on:** 14-trading-journal.md

---

## User Story

As a retail investor, I want a single page where I can see all my broker connections (Kite, Groww, AngelOne, HDFC Sky) and their sync status, so I can manage integrations from one place.

---

## Screens / Components

- `BrokerHubPage` — grid of 4 broker cards; route `/trading/brokers`
- `BrokerCard` — per-broker: logo, status badge, last synced, action buttons (Connect / Sync / Disconnect)
- `BrokerStatusBadge` — `CONNECTED` (green) | `DISCONNECTED` (gray) | `ERROR` (red)

---

## Data Shape

```typescript
type BrokerSlug = 'KITE' | 'GROWW' | 'ANGELONE' | 'HDFC_SKY'
type ConnectionType = 'API' | 'CSV'
type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

interface BrokerConnection {
  id: string
  broker: BrokerSlug
  connectionType: ConnectionType
  status: ConnectionStatus
  lastSyncedAt: string | null        // ISO datetime
  errorMessage: string | null
  syncSummary: {
    tradesSynced: number
    duplicatesSkipped: number
  } | null
}
```

## State

- TanStack Query: `useBrokerConnectionsQuery` — `GET /api/v1/integrations`
- TanStack Query mutation: `useDisconnectBrokerMutation` — `DELETE /api/v1/integrations/:broker`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/integrations` | All broker connections for authenticated user |
| DELETE | `/api/v1/integrations/:broker` | Disconnect broker, clear credentials |

---

## Prisma Schema (add to schema.prisma)

```prisma
model BrokerConnection {
  id              String   @id @default(cuid())
  userId          String
  broker          String   // KITE | GROWW | ANGELONE | HDFC_SKY
  connectionType  String   // API | CSV
  status          String   @default("DISCONNECTED")
  credentialsJson String?  // AES-256 encrypted; null for CSV-only brokers
  lastSyncedAt    DateTime?
  errorMessage    String?
  tradesSynced    Int      @default(0)
  duplicatesSkipped Int    @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, broker])
}
```

Also add to existing `Trade` model: `broker String? // KITE|GROWW|ANGELONE|HDFC_SKY|null`

---

## Key Logic

- GET `/api/v1/integrations` returns all 4 broker entries; if no DB row for a broker, return default `{ broker, status: 'DISCONNECTED', ... }`
- HDFC Sky: `connectionType` always `'CSV'`; Connect button routes to `/trading/import?broker=HDFC_SKY`
- Kite + Groww: `connectionType: 'API'`; Connect/Sync routes to `/trading/kite` or `/trading/groww`
- AngelOne: `connectionType: 'API'`; Connect routes to `/trading/angelone`
- DELETE clears `credentialsJson`, sets `status: 'DISCONNECTED'`

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading/brokers` | `BrokerHubPage` | Protected |

---

## Acceptance Criteria

- [ ] All 4 broker cards render with correct logos and status
- [ ] DISCONNECTED broker shows Connect button; CONNECTED shows Sync + Disconnect
- [ ] Disconnect clears credentials and sets status to DISCONNECTED
- [ ] HDFC Sky Connect button routes to CSV import page
- [ ] Last synced timestamp shown in relative format (e.g. "2 hours ago")
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Broker Integration Hub API per `specs/15-broker-hub.md`. Stack: Node + Express + TypeScript + Prisma. Add `BrokerConnection` model to schema; add `broker` field to `Trade` model. Endpoints: GET `/api/v1/integrations` (return all 4 brokers, defaulting missing rows to DISCONNECTED), DELETE `/api/v1/integrations/:broker` (clear credentials, set DISCONNECTED).

## /fe Prompt

> Build the Broker Hub UI per `specs/15-broker-hub.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/trading/brokers`. 4-card grid showing Kite, Groww, AngelOne, HDFC Sky. Each card: broker name, status badge, last synced, action buttons. HDFC Sky Connect → `/trading/import?broker=HDFC_SKY`. Others route to their own pages.
