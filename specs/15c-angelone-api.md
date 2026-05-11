# 15c — AngelOne API Sync

**Goal:** Connect AngelOne SmartAPI using stored credentials (clientCode + API key + TOTP secret) and sync trade book into the trading journal.

**Depends on:** 15-broker-hub.md

---

## User Story

As an AngelOne user, I want to enter my SmartAPI credentials once and sync my trade history automatically, without re-entering them each session.

---

## Screens / Components

- `AngelOneSyncPage` — route `/trading/angelone`
- `AngelOneConnectModal` — form: Client Code, API Key, TOTP Secret (masked); Save button
- `SyncResultSummary` — shared component (same as 15b)

---

## Data Shape

```typescript
interface AngelOneCredentials {
  clientCode: string
  apiKey: string
  totpSecret: string    // base32 TOTP seed — stored AES-256 encrypted
}

interface AngelOneSyncResult {
  tradesSynced: number
  duplicatesSkipped: number
  errors: string[]
}
```

## State

- TanStack Query: `useAngelOneStatusQuery` — `GET /api/v1/integrations` (filter broker=ANGELONE)
- TanStack Query mutation: `useAngelOneConnectMutation` — `POST /api/v1/integrations/angelone/connect`
- TanStack Query mutation: `useAngelOneSyncMutation` — `POST /api/v1/integrations/angelone/sync`
- Local state: `AngelOneSyncPage` — `showConnectModal: boolean`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/integrations/angelone/connect` | Validate credentials + test auth; store encrypted |
| POST | `/api/v1/integrations/angelone/sync` | Auth with stored creds, fetch trade book, insert trades |

---

## AngelOne SmartAPI Calls (Direct REST)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword` | POST | Auth: returns `jwtToken` |
| `https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getTradeBook` | GET | Today's trades (requires `Authorization: Bearer <jwtToken>`) |

- TOTP generated server-side from stored `totpSecret` using `otplib`
- Auth payload: `{ clientcode, password: sha256(password), totp }` — per SmartAPI docs
- Note: SmartAPI `getTradeBook` returns today's trades only; for historical, use `getOrderBook` by date range

---

## Key Logic

- **Credential encryption**: `AES-256-CBC` with `process.env.ENCRYPTION_KEY` (32-byte); store IV + ciphertext as `iv:ciphertext` in `credentialsJson`
- **Connect validation**: after storing, immediately attempt auth; if fails → return 400 `{ error: 'InvalidCredentials' }`; do not persist
- **Price normalization**: SmartAPI returns `tradePrice` as float → `Math.round(tradePrice × 100)` → paise
- **Duplicate detection**: skip if `userId + symbol + tradeDate + quantity + pricePaise` exists in `Trade` table
- **Trade insert fields**: `importedFrom: 'ANGELONE'`, `broker: 'ANGELONE'`
- **BrokerConnection update**: set `lastSyncedAt`, counts, `status: 'CONNECTED'`; on auth failure set `status: 'ERROR'`, `errorMessage: 'Session expired — re-enter credentials'`

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading/angelone` | `AngelOneSyncPage` | Protected |

---

## Acceptance Criteria

- [ ] Connect modal validates credentials against AngelOne before saving
- [ ] Invalid credentials show clear error; nothing stored in DB
- [ ] `credentialsJson` never exposed in any API response
- [ ] Sync fetches trades and deduplicates by symbol+date+qty+price
- [ ] Auth failure during sync shows "Re-enter credentials" prompt; sets status ERROR
- [ ] `ENCRYPTION_KEY` env var required; server fails fast if missing at startup
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build AngelOne API sync per `specs/15c-angelone-api.md`. Stack: Node + Express + TypeScript + Prisma + otplib. POST /connect validates SmartAPI auth (TOTP from totpSecret via otplib), AES-256-CBC encrypts credentials into BrokerConnection.credentialsJson. POST /sync decrypts creds, generates fresh TOTP, authenticates, fetches trade book, deduplicates, batch-inserts into Trade with broker='ANGELONE'. Never expose credentialsJson in responses.

## /fe Prompt

> Build AngelOne sync page per `specs/15c-angelone-api.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/trading/angelone`. Show connect modal (Client Code, API Key, TOTP Secret with masked input + toggle). Connected state shows last synced + Sync button. Auth failure shows re-enter-credentials alert.
