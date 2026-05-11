# 10 — CSV Import Engine

**Goal:** Parse bank statement CSVs from HDFC, ICICI, SBI, and Axis Bank; auto-categorize transactions; surface review UI before committing.

**Depends on:** 09-expense-tracker.md, 08-income-tracker.md

---

## User Story

As a user, I want to upload my bank statement CSV and have transactions automatically categorized so I can import months of history without manual entry.

---

## Screens / Components

- `CsvImportPage` — stepper: Upload → Review → Done
- `CsvUploadZone` — drag-and-drop file input, bank format auto-detection status
- `CsvReviewTable` — editable table of parsed rows; category dropdown per row; duplicate rows flagged in amber
- `ImportSummary` — post-import: X imported, Y duplicates skipped, Z errors

---

## Data Shape

```typescript
type BankFormat = 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'UNKNOWN'

interface ParsedTransaction {
  date: string            // YYYY-MM-DD
  description: string     // raw bank narration
  amountPaise: number     // absolute value; sign from debit/credit
  type: 'DEBIT' | 'CREDIT'
  suggestedCategory: ExpenseCategory | IncomeCategory | null
  isDuplicate: boolean
  selected: boolean       // user can deselect rows before import
}

interface CsvImportRequest {
  transactions: ParsedTransaction[]
}
```

## State

- Local state: `CsvImportPage` — `step`, `parsedRows`, `bankFormat`
- TanStack Query mutation: `useImportMutation` — POST `/api/v1/import/csv`

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/import/csv/parse` | Upload file (multipart), returns `ParsedTransaction[]` |
| POST | `/api/v1/import/csv/commit` | Commit selected transactions to income/expense tables |

---

## Key Logic

### Bank format detection (by header row)
- HDFC: columns `Date,Narration,Value Dat,Debit Amount,Credit Amount,Chq/Ref No,Closing Balance`
- ICICI: columns `Transaction Date,Value Date,Description,Ref No,Debit,Credit,Balance`
- SBI: columns `Txn Date,Value Date,Description,Ref No./Cheque No.,Debit,Credit,Balance`
- Axis: columns `Tran Date,Chq No,Particulars,Debit,Credit,Balance`

### Category auto-mapping (keyword matching on narration, case-insensitive)
- `swiggy|zomato|dominos` → FOOD
- `uber|ola|rapido|irctc` → TRANSPORT
- `netflix|spotify|prime` → ENTERTAINMENT
- `hdfc home loan|emi|loan repay` → EMI
- `salary|infosys|tcs|wipro` (CREDIT) → SALARY
- `rent received` (CREDIT) → RENTAL
- `dividend` (CREDIT) → DIVIDEND
- Default: DEBIT → OTHER; CREDIT → OTHER income

### Duplicate detection
- Match against existing expense/income records: same `userId + date + amountPaise`
- Mark `isDuplicate: true`; pre-deselect in review table

### Commit routing
- CREDIT rows → `POST /api/v1/income` (batch)
- DEBIT rows → `POST /api/v1/expenses` (batch)

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/import` | `CsvImportPage` | Protected |

---

## Acceptance Criteria

- [ ] Auto-detects HDFC, ICICI, SBI, Axis formats
- [ ] Duplicate rows flagged amber in review table; pre-deselected
- [ ] User can edit category per row before committing
- [ ] User can deselect individual rows to skip
- [ ] Commit routes CREDIT to income, DEBIT to expense
- [ ] ImportSummary shows counts: imported / duplicates skipped / errors
- [ ] File size limit: 5MB; unsupported format shows clear error
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the CSV Import engine per `specs/10-csv-import.md`. Stack: Node + Express + TypeScript + Multer (file upload). Two endpoints: parse (detect format, return rows with suggestedCategory + isDuplicate) and commit (batch insert into income/expense tables). Keyword-based auto-categorization as documented.

## /fe Prompt

> Build the CSV Import UI per `specs/10-csv-import.md`. Stack: React 18 + Vite + TypeScript + Tailwind + TanStack Query. 3-step flow: Upload → Review (editable table) → Done. Route `/import`. Duplicate rows styled amber. Category column uses dropdown.
