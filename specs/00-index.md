# Specs Index — Retirement Pro (Desi FIRE Dashboard)

> Updated: 2026-05-10 | Stack: Node.js + Express + TypeScript + MySQL (Hostinger) + Prisma (backend) · React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Zustand + TanStack Query (frontend)

## Build Order

### Phase 0 — Foundation (v1)
| # | File | Feature | Depends On | Status |
|---|------|---------|-----------|--------|
| 00-be | 00-backend.md | Node/Express scaffold + Prisma schema + JWT auth | — | [ ] |
| 00-fe | 00-foundation.md | React scaffold + design tokens + routing shell + API client | 00-be | [ ] |
| 01 | 01-portfolio-ledger.md | Multi-asset holdings CRUD (MF/NPS/EPF/PPF/Stocks) | 00-fe | [ ] |
| 02 | 02-fire-calculator.md | FIRE corpus calculator — persist inputs/results | 01 | [ ] |
| 03 | 03-projection-chart.md | Corpus growth projection charts (Recharts) | 02 | [ ] |
| 04 | 04-health-score.md | Financial wellness diagnostic (6-pillar health score) | 01 | [ ] |
| 05 | 05-goal-tracker.md | FIRE goal + milestone sub-goals CRUD | 02 | [ ] |
| 06 | 06-gamification.md | Achievement badges + streaks + behavioral nudges | 05 | [ ] |
| 07 | 07-tax-alerts.md | LTCG harvesting alerts + 3-bucket allocation | 01 | [ ] |

### Phase 1 — Financial Tracking Foundation (v2)
| # | File | Feature | Depends On | Status |
|---|------|---------|-----------|--------|
| 08 | 08-income-tracker.md | Multi-source income CRUD | 00-fe | [ ] |
| 09 | 09-expense-tracker.md | Expense log + categorization | 00-fe | [ ] |
| 10 | 10-csv-import.md | Bank statement CSV import engine | 08, 09 | [ ] |
| 11 | 11-liabilities-manager.md | Loans + EMI tracking | 00-fe | [ ] |

### Phase 2 — Aggregation & Insights (v2)
| # | File | Feature | Depends On | Status |
|---|------|---------|-----------|--------|
| 12 | 12-cashflow-dashboard.md | Monthly income vs expense P&L | 08, 09 | [ ] |
| 13 | 13-networth-engine.md | Live net worth aggregation + history | 01, 08, 11 | [ ] |
| 14 | 14-trading-journal.md | Manual trade log + FIFO P&L | 00-fe | [ ] |

### Phase 3 — Broker Integrations & Asset Management (v2)
| # | File | Feature | Depends On | Status |
|---|------|---------|-----------|--------|
| 15 | 15-broker-hub.md | Broker Hub — unified connection model + hub UI | 14 | [ ] |
| 15b | 15b-kite-groww-api.md | Kite + Groww API sync via MCP tools | 15 | [ ] |
| 15c | 15c-angelone-api.md | AngelOne SmartAPI sync (stored credentials) | 15 | [ ] |
| 15d | 15d-broker-csv-import.md | Broker CSV import — trade book (all 4 brokers) | 15 | [ ] |
| 16 | 16-asset-allocation.md | Target allocation + rebalancing | 01, 14 | [ ] |
| 17 | 17-factor-analysis.md | Factor exposure + benchmark comparison | 16, 14 | [ ] |
| 18 | 18-consolidated-dashboard.md | Unified overview dashboard | 12, 13, 16, 05 | [ ] |

## How to Use

Pass each spec to `/be` then `/fe` in phase order:

```
# Phase 0 (existing v1 specs)
/be @specs/00-backend.md
/fe @specs/00-foundation.md
/fe @specs/01-portfolio-ledger.md
...

# Phase 1
/be @specs/08-income-tracker.md     → /fe @specs/08-income-tracker.md
/be @specs/09-expense-tracker.md    → /fe @specs/09-expense-tracker.md
/be @specs/10-csv-import.md         → /fe @specs/10-csv-import.md
/be @specs/11-liabilities-manager.md → /fe @specs/11-liabilities-manager.md

# Phase 2
/be @specs/12-cashflow-dashboard.md → /fe @specs/12-cashflow-dashboard.md
/be @specs/13-networth-engine.md    → /fe @specs/13-networth-engine.md
/be @specs/14-trading-journal.md    → /fe @specs/14-trading-journal.md

# Phase 3
/be @specs/15-broker-hub.md         → /fe @specs/15-broker-hub.md
/be @specs/15b-kite-groww-api.md    → /fe @specs/15b-kite-groww-api.md
/be @specs/15c-angelone-api.md      → /fe @specs/15c-angelone-api.md
/be @specs/15d-broker-csv-import.md → /fe @specs/15d-broker-csv-import.md
/fe @specs/16-asset-allocation.md
/fe @specs/17-factor-analysis.md
/fe @specs/18-consolidated-dashboard.md
```

Mark `[ ]` → `[x]` as each feature is built. Full platform vision: `specs/roadmap-v2.md`.

## Global Invariants (apply to every spec)

- SWR: 3% (Rule of 33x corpus)
- Inflation: General 6%, Medical 12%, Urban Lifestyle 8%
- Life expectancy default: 90 years; default retirement age: 45
- Tax: LTCG 12.5% on gains > ₹1.25L; NPS annuity 20% mandatory; STCG 20%
- All monetary values in Indian Rupees (₹), stored as integers (paise) in DB
- Auth: JWT (access 15m + refresh 7d); all routes except /auth/* require `Authorization: Bearer <token>`
- API base URL: `http://localhost:3001/api/v1` (dev); env var `VITE_API_URL` on frontend
- DB: MySQL (Hostinger) via Prisma ORM; run `prisma migrate dev` before starting
- Risk-free rate: 6.5% (RBI repo rate) for Sharpe/Sortino calculations
- Broker integrations: Kite + Groww via MCP session tools; AngelOne via SmartAPI (stored AES-256 credentials + otplib TOTP); HDFC Sky via CSV only
- CSV trade book import supports Kite, Groww, AngelOne, HDFC Sky — broker auto-detected by header row
