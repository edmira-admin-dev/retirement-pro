# 15d — Broker CSV Import (Trade Book)

**Goal:** Parse trade book CSV exports from Kite, Groww, AngelOne, and HDFC Sky; normalize to unified trade schema; surface review UI before committing.

**Depends on:** 15-broker-hub.md, 14-trading-journal.md

---

## User Story

As an investor using any of the 4 supported brokers, I want to upload my trade book CSV and review parsed trades before they are added to my journal.

---

## Screens / Components

- `BrokerCsvImportPage` — route `/trading/import`; stepper: Upload → Review → Done
- `BrokerCsvUploadZone` — drag-and-drop, broker auto-detection badge, optional `?broker=` query param pre-selects
- `TradeReviewTable` — parsed rows: Date, Symbol, Buy/Sell, Qty, Price, Duplicate flag
- `ImportSummary` — synced count, duplicates skipped, errors

---

## Data Shape

```typescript
type BrokerSlug = 'KITE' | 'GROWW' | 'ANGELONE' | 'HDFC_SKY'

interface ParsedTradeRow {
  tradeDate: string           // YYYY-MM-DD
  symbol: string              // e.g. INFY, RELIANCE
  exchange: string            // NSE | BSE
  transactionType: 'BUY' | 'SELL'
  quantity: number
  pricePaise: number          // price × 100
  isDuplicate: boolean
  selected: boolean
}

interface CsvImportRequest {
  broker: BrokerSlug
  trades: ParsedTradeRow[]
}
```

## State

- Local state: `BrokerCsvImportPage` — `step`, `parsedRows`, `detectedBroker`
- TanStack Query mutation: `useCsvParseMutation` — `POST /api/v1/integrations/csv/parse` (multipart)
- TanStack Query mutation: `useCsvCommitMutation` — `POST /api/v1/integrations/csv/commit`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/integrations/csv/parse` | Upload CSV (multipart), detect broker, return ParsedTradeRow[] |
| POST | `/api/v1/integrations/csv/commit` | Commit selected rows to Trade table |

---

## Key Logic

### Format detection (by header row, case-insensitive match)

| Broker | Discriminating Header Columns |
|--------|-------------------------------|
| KITE | `trade_id` AND `tradingsymbol` |
| GROWW | `instrument name` AND `trade type` |
| ANGELONE | `trade no` AND `scrip name` |
| HDFC_SKY | `stock symbol` AND `order type` |

### Column mapping per broker

**KITE** (`tradingsymbol, trade_date, transaction_type, quantity, price, exchange`):
- `tradeDate` ← `trade_date` (parse `YYYY-MM-DD` or `DD-MM-YYYY`)
- `symbol` ← `tradingsymbol`
- `transactionType` ← `transaction_type` (BUY/SELL)
- `pricePaise` ← `Math.round(parseFloat(price) × 100)`

**GROWW** (`Trade Date, Instrument Name, Trade Type, Quantity, Price, Exchange`):
- `tradeDate` ← `Trade Date` (parse `DD-MMM-YYYY`)
- `symbol` ← `Instrument Name`
- `transactionType` ← `Trade Type` (Buy→BUY, Sell→SELL)

**ANGELONE** (`Trade Date, Scrip Name, Buy/Sell, Qty, Net Rate, Exchange`):
- `symbol` ← `Scrip Name`
- `transactionType` ← `Buy/Sell` (B→BUY, S→SELL)
- `pricePaise` ← `Math.round(parseFloat('Net Rate') × 100)`

**HDFC_SKY** (`Trade Date, Stock Symbol, Buy/Sell, Quantity, Trade Price, Exchange`):
- Standard column names; `Buy/Sell` → BUY/SELL

### Duplicate detection
- Match existing `Trade` rows: `userId + symbol + tradeDate + quantity + pricePaise`
- `isDuplicate: true` → pre-deselect in review table, shown in amber

### Commit
- Insert selected rows into `Trade` with `importedFrom: 'CSV_KITE'|'CSV_GROWW'|'CSV_ANGELONE'|'CSV_HDFC_SKY'` and `broker` field
- Update `BrokerConnection` for the detected broker: `lastSyncedAt`, `tradesSynced`, `duplicatesSkipped`
- File size limit: 5 MB; reject with `400` if exceeded

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/trading/import` | `BrokerCsvImportPage` | Protected; accepts `?broker=HDFC_SKY` query param |

---

## Acceptance Criteria

- [ ] Auto-detects all 4 broker formats by header row
- [ ] Unknown format shows clear error with expected format list
- [ ] Duplicate rows flagged amber, pre-deselected
- [ ] User can deselect individual rows before committing
- [ ] Commit inserts only selected, non-duplicate rows
- [ ] `importedFrom` and `broker` fields correctly set per broker
- [ ] BrokerConnection updated after commit
- [ ] File size > 5MB rejected with user-facing error
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Broker CSV Import engine per `specs/15d-broker-csv-import.md`. Stack: Node + Express + TypeScript + Multer + Prisma. Parse endpoint: detect broker from header, map columns to ParsedTradeRow, mark duplicates. Commit endpoint: batch insert into Trade with importedFrom/broker, update BrokerConnection. Support Kite, Groww, AngelOne, HDFC Sky column mappings as documented.

## /fe Prompt

> Build the Broker CSV Import UI per `specs/15d-broker-csv-import.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. Route `/trading/import`. 3-step flow: Upload (drag-and-drop + broker detection badge) → Review (table with checkboxes, duplicate rows in amber) → Done (ImportSummary). Pre-select broker from `?broker=` query param.
