# 17 — Portfolio Factor Analysis

**Goal:** Expose portfolio factor tilts (value, momentum, quality), compare performance against Nifty 50, and display risk-adjusted return metrics.

**Depends on:** 16-asset-allocation.md, 14-trading-journal.md

---

## User Story

As an investor, I want to see my portfolio's factor exposures and how it performs vs the Nifty 50 so I can understand if I'm getting compensated for the risks I'm taking.

---

## Screens / Components

- `AnalyticsPage` — tabbed: Factor Exposure | Benchmark Comparison | Risk Metrics
- `FactorRadarChart` — radar chart: Value / Momentum / Quality / Size / Low Volatility (scores 0–100)
- `BenchmarkComparisonChart` — line chart: portfolio vs Nifty 50 cumulative returns (indexed to 100)
- `RollingReturnsTable` — 1M / 3M / 6M / 1Y / 3Y returns for portfolio vs benchmark
- `RiskMetricsCards` — Sharpe, Sortino, Max Drawdown, Beta, Alpha, Tracking Error

---

## Data Shape

```typescript
interface FactorScores {
  value: number        // 0–100; derived from P/E, P/B of equity holdings
  momentum: number     // 0–100; 12-1 month price return of holdings
  quality: number      // 0–100; ROE-based proxy (user enters or inferred from category)
  size: number         // 0–100; large cap bias = high score
  lowVolatility: number // 0–100; based on beta of holdings
}

interface PerformancePoint {
  date: string         // YYYY-MM-DD (monthly)
  portfolioIndexed: number   // rebased to 100 at start
  benchmarkIndexed: number   // Nifty 50 rebased to 100 at start
}

interface RiskMetrics {
  sharpeRatio: number        // (Rp - Rf) / σ; Rf = 6.5% (RBI repo rate)
  sortinoRatio: number       // (Rp - Rf) / σ_downside
  maxDrawdownPct: number     // peak-to-trough %
  beta: number               // vs Nifty 50
  alpha: number              // annualized excess return vs benchmark
  trackingErrorPct: number   // std dev of (portfolio return - benchmark return)
  calmarRatio: number        // CAGR / |maxDrawdown|
}

interface PortfolioAnalytics {
  factorScores: FactorScores
  performanceHistory: PerformancePoint[]
  rollingReturns: { period: '1M'|'3M'|'6M'|'1Y'|'3Y'; portfolioPct: number; benchmarkPct: number }[]
  riskMetrics: RiskMetrics
  benchmarkUsed: string      // "Nifty 50"
}
```

## State

- TanStack Query: `useAnalyticsQuery` — `GET /api/v1/analytics`
- Local state: `AnalyticsPage` — `activeTab`, `benchmarkSelected` (default: 'NIFTY50')

---

## API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics` | Full analytics: factor scores + performance + risk metrics |

---

## Key Logic

### Factor scoring (proxy — no paid feed required)
- **Value**: equity holdings with user-entered or MF-category-inferred P/E < market avg → higher score; average P/E of Nifty 50 = 22 (hardcoded as baseline)
- **Momentum**: for stock holdings, compute `(currentPrice − price12MthAgo) / price12MthAgo`; use Kite LTP if connected; else use user-entered values
- **Quality**: use `MF_EQUITY` sub-category tags (Large Cap = quality proxy 80, Mid Cap = 55, Small Cap = 30)
- **Size**: % of equity allocation in Large Cap MFs + large-cap stocks → higher = higher size score
- **Low Volatility**: beta < 1 → low vol bias; default beta = 1 if no data

### Performance calculation
- Portfolio XIRR from `Trade` records (buy as negative CF, current value as positive CF at today)
- Benchmark: hardcode Nifty 50 annual returns (last 5Y): 2020=15%, 2021=24%, 2022=4%, 2023=20%, 2024=9% — source: NSE; update annually
- Indexed performance: `portfolioIndexed[t] = 100 × (1 + cumulativeReturn[t])`

### Risk metrics
- `Rf = 6.5%` (RBI repo rate; hardcoded, update semi-annually)
- Sharpe: `(portfolioCagr − 0.065) / annualizedStdDev`
- Sortino: `(portfolioCagr − 0.065) / downsideStdDev`
- Max Drawdown: `max((peakValue − troughValue) / peakValue)` over history
- Tracking Error: `std_dev(portfolio monthly return − benchmark monthly return) × √12`

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/analytics` | `AnalyticsPage` | Protected |

---

## Acceptance Criteria

- [ ] Factor radar chart renders with 5 axes and score fill
- [ ] Benchmark comparison chart (line) shows portfolio vs Nifty 50 indexed to 100
- [ ] Rolling returns table shows 5 periods × 2 columns (portfolio vs benchmark)
- [ ] Risk metrics cards show all 7 metrics with correct units
- [ ] Graceful state when insufficient data (< 3 months): show "Not enough history" for affected metrics
- [ ] Hardcoded Nifty 50 benchmark returns clearly labeled "Source: NSE historical data"
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

---

## /be Prompt

> Build the Portfolio Analytics API per `specs/17-factor-analysis.md`. Stack: Node + Express + TypeScript + Prisma. Compute factor scores from holdings metadata; calculate XIRR-based portfolio performance; generate risk metrics (Sharpe, Sortino, Max Drawdown, Beta, Alpha, Tracking Error, Calmar). Use hardcoded Nifty 50 annual returns as benchmark.

## /fe Prompt

> Build the Portfolio Factor Analysis UI per `specs/17-factor-analysis.md`. Stack: React 18 + Vite + TypeScript + Tailwind + Recharts + TanStack Query. Route `/analytics`. Tabbed layout. RadarChart for factors; LineChart for benchmark comparison (indexed to 100); rolling returns table; risk metric cards.
