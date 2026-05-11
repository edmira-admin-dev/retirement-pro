# Retirement Pro — Full Platform Roadmap v2

> Updated: 2026-05-10 | Scope: One-stop financial OS for Indian retail investors
> Assumptions: Retail investor (not fund manager), Indian market (NSE/BSE/SEBI), INR only

---

## What This Platform Covers

| Category | Capability |
|----------|-----------|
| **Portfolio** | Multi-asset holdings (MF/NPS/EPF/PPF/Stocks/Gold/Real Estate) |
| **Income** | Multi-source income tracking (salary/freelance/rental/dividends/business) |
| **Expenses** | Expense log + categorization + CSV bank import |
| **Liabilities** | Loan/EMI tracking, debt payoff calculator |
| **Cash Flow** | Monthly income vs expense P&L, savings rate, 12-month trend |
| **Net Worth** | Live aggregation: assets − liabilities, historical chart |
| **Trading** | Manual trade journal + Zerodha Kite sync, realized/unrealized P&L |
| **Asset Management** | Target allocation, drift detection, rebalancing suggestions |
| **Factor Analysis** | Portfolio factors (value/momentum/quality), benchmark comparison |
| **FIRE Planning** | Corpus calculator, projection charts, goal tracker |
| **Health Score** | 6-pillar financial wellness diagnostic |
| **Tax** | LTCG harvesting alerts, 3-bucket allocation |
| **Gamification** | Badges, streaks, behavioral nudges |

---

## Module Inventory

### Already Specced (v1)

| Spec | Module | Status |
|------|--------|--------|
| 00-backend.md | Node/Express + Prisma + JWT auth | [ ] |
| 00-foundation.md | React scaffold + routing + design tokens | [ ] |
| 01-portfolio-ledger.md | Multi-asset holdings CRUD | [ ] |
| 02-fire-calculator.md | FIRE corpus calculator | [ ] |
| 03-projection-chart.md | Corpus growth projection (Recharts) | [ ] |
| 04-health-score.md | 6-pillar financial health score | [ ] |
| 05-goal-tracker.md | FIRE goal + milestone CRUD | [ ] |
| 06-gamification.md | Badges + streaks | [ ] |
| 07-tax-alerts.md | LTCG harvesting alerts | [ ] |

### New Modules (v2)

| Spec | Module | Priority | Phase |
|------|--------|----------|-------|
| 08-income-tracker.md | Income sources CRUD | P0 | 1 |
| 09-expense-tracker.md | Expense log + categorization | P0 | 1 |
| 10-csv-import.md | Bank statement CSV import engine | P1 | 1 |
| 11-liabilities-manager.md | Loans + EMI tracking | P0 | 1 |
| 12-cashflow-dashboard.md | Monthly income vs expense P&L | P0 | 2 |
| 13-networth-engine.md | Live net worth aggregation | P0 | 2 |
| 14-trading-journal.md | Manual trade log + P&L | P1 | 2 |
| 15-kite-integration.md | Zerodha Kite API sync | P2 | 3 |
| 16-asset-allocation.md | Target allocation + rebalancing | P1 | 3 |
| 17-factor-analysis.md | Factor exposure + benchmark | P2 | 3 |
| 18-consolidated-dashboard.md | Unified overview dashboard | P1 | 3 |

---

## Build Phases

### Phase 1 — Financial Tracking Foundation
Core data capture: where money comes from, where it goes, what you owe.

```
/be @specs/08-income-tracker.md      ← income CRUD API
/fe @specs/08-income-tracker.md      ← income UI
/be @specs/09-expense-tracker.md     ← expense CRUD API
/fe @specs/09-expense-tracker.md     ← expense UI
/be @specs/10-csv-import.md          ← CSV parser + categorizer
/fe @specs/10-csv-import.md          ← upload + review UI
/be @specs/11-liabilities-manager.md ← loans CRUD API
/fe @specs/11-liabilities-manager.md ← loans UI
```

### Phase 2 — Aggregation & Insights
Compute the big picture from Phase 1 data.

```
/fe @specs/12-cashflow-dashboard.md  ← income vs expense charts
/be @specs/13-networth-engine.md     ← net worth aggregation API
/fe @specs/13-networth-engine.md     ← live net worth UI
/be @specs/14-trading-journal.md     ← trade log API
/fe @specs/14-trading-journal.md     ← trade journal UI
```

### Phase 3 — Asset Management & Advanced
Active portfolio management and broker integration.

```
/be @specs/15-kite-integration.md    ← Kite sync service
/fe @specs/15-kite-integration.md    ← Kite connect UI
/fe @specs/16-asset-allocation.md    ← allocation + rebalancing UI
/fe @specs/17-factor-analysis.md     ← factor exposure + benchmark UI
/fe @specs/18-consolidated-dashboard.md ← unified dashboard
```

---

## Net Worth Formula

```
Net Worth = Σ(Portfolio holdings at current value)
          + Σ(Bank/cash accounts)
          + Σ(Real estate current value)
          - Σ(Outstanding loan principals)
```

All values in paise (integer). Divide by 100 for display.
Recalculate on: holdings mutation, income/expense entry, liability update.

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Trading data source | Manual journal + Kite sync (optional) | Works offline; Kite adds real-time layer |
| Expense data entry | Manual + CSV import (HDFC/ICICI/SBI/Axis) | Manual for control; CSV for bulk history |
| Asset management depth | Tracking + rebalancing + factor analysis | User requested full AM capability |
| Factor data source | User-entered sector/style + Kite quote prices | Avoids paid data feed dependency |
| Rebalancing trigger | Drift >5% from target allocation | Standard threshold-based approach |
| Benchmark | Nifty 50 (default), user-selectable | Most relevant Indian benchmark |
| P&L method | FIFO cost basis for trades | SEBI-aligned, simplest for retail |

---

## New Routes Added

| Path | Module |
|------|--------|
| `/income` | Income Tracker |
| `/expenses` | Expense Tracker |
| `/liabilities` | Liabilities Manager |
| `/cashflow` | Cash Flow Dashboard |
| `/networth` | Net Worth Engine |
| `/trading` | Trading Journal |
| `/trading/kite` | Kite Integration |
| `/allocation` | Asset Allocation |
| `/analytics` | Factor Analysis |

---

## Next Step

Start Phase 1:
```
/be @specs/08-income-tracker.md
```
