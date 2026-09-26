import axios from 'axios'
import { IndexKey, INDICES } from './index-master.service'

// Yahoo Finance tickers for each benchmark. NIFTY50/100/NEXT50/MIDCAP150 map to
// the real index directly (verified via each ticker's `longName`); Nifty 500
// has no direct index ticker on Yahoo, so it's tracked via a 1:1 ETF proxy —
// small tracking error/expense-ratio drag vs the true index, and history only
// goes back to the ETF's 2023 inception (so 5Y/ALL won't be available for it).
const YAHOO_SYMBOL: Partial<Record<IndexKey, string>> = {
  NIFTY50: '^NSEI',
  NIFTY_100: '^CNX100',
  NIFTY_NEXT_50: '^NSMIDCP',
  NIFTY_MIDCAP_150: 'NIFTYMIDCAP150.NS',
  NIFTY_500: 'MONIFTY500.NS',
  NIFTY500_MOMENTUM_50: 'MOMENTUM50.NS',
}

const PROXY_NOTE: Partial<Record<IndexKey, string>> = {
  NIFTY_500: 'Tracked via Motilal Oswal Nifty 500 ETF (MONIFTY500.NS) — no direct index ticker available; history starts Sept 2023.',
  NIFTY500_MOMENTUM_50: 'Tracked via Motilal Oswal Nifty 500 Momentum 50 ETF (MOMENTUM50.NS) — no direct index ticker available; history starts Sept 2024.',
}

export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'ALL'

const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL']

// Portfolio holdings started on this date — "ALL" is anchored here for both
// the benchmarks and the portfolio so the comparison is apples-to-apples.
const PORTFOLIO_INCEPTION = new Date('2026-01-01T00:00:00Z')

export interface IndexReturns {
  index: IndexKey
  label: string
  asOfDate: string
  latestClose: number
  returns: Partial<Record<Period, number>>
  note?: string
  error?: string
}

interface ClosePoint { date: Date; close: number }

function periodStartDate (period: Period, latest: Date): Date {
  const d = new Date(latest)
  switch (period) {
    case '1D': d.setUTCDate(d.getUTCDate() - 1); return d
    case '1W': d.setUTCDate(d.getUTCDate() - 7); return d
    case '1M': d.setUTCMonth(d.getUTCMonth() - 1); return d
    case '3M': d.setUTCMonth(d.getUTCMonth() - 3); return d
    case '6M': d.setUTCMonth(d.getUTCMonth() - 6); return d
    case 'YTD': return new Date(Date.UTC(latest.getUTCFullYear(), 0, 1))
    case '1Y': d.setUTCFullYear(d.getUTCFullYear() - 1); return d
    case '5Y': d.setUTCFullYear(d.getUTCFullYear() - 5); return d
    case 'ALL': return PORTFOLIO_INCEPTION
  }
}

// Finds the latest trading-day close on or before the target date (markets
// are closed weekends/holidays, so the exact calendar date rarely has data).
// Returns null if the series doesn't reach back that far (e.g. an ETV proxy
// with a later inception date than the requested period).
function closeOnOrBefore (series: ClosePoint[], target: Date): ClosePoint | null {
  let best: ClosePoint | null = null
  for (const point of series) {
    if (point.date.getTime() <= target.getTime()) {
      if (!best || point.date.getTime() > best.date.getTime()) best = point
    }
  }
  if (best && series[0].date.getTime() > target.getTime() + 5 * 24 * 60 * 60 * 1000) return null
  return best
}

async function fetchYahooHistory (symbol: string, from: Date, to: Date): Promise<ClosePoint[]> {
  const period1 = Math.floor(from.getTime() / 1000)
  const period2 = Math.floor(to.getTime() / 1000)
  const { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
    params: { period1, period2, interval: '1d' },
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
    timeout: 15000,
  })

  const result = (data as { chart?: { result?: unknown[] } })?.chart?.result?.[0] as
    { timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[] }[] } } | undefined
  const timestamps = result?.timestamp ?? []
  const closes = result?.indicators?.quote?.[0]?.close ?? []

  const series: ClosePoint[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i]
    if (close === null || close === undefined || !Number.isFinite(close)) continue
    series.push({ date: new Date(timestamps[i] * 1000), close })
  }
  return series.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export async function getIndexReturns (indexKey: IndexKey): Promise<IndexReturns> {
  const meta = INDICES.find(i => i.key === indexKey)
  const symbol = YAHOO_SYMBOL[indexKey]
  if (!meta || !symbol) throw new Error(`No historical-return support for index: ${indexKey}`)

  const to = new Date()
  const from = new Date(Math.min(PORTFOLIO_INCEPTION.getTime(), to.getTime() - 5.2 * 365 * 24 * 60 * 60 * 1000))

  try {
    const series = await fetchYahooHistory(symbol, from, to)
    if (series.length === 0) throw new Error('No historical data returned')

    const latest = series[series.length - 1]
    const returns: Partial<Record<Period, number>> = {}
    for (const period of PERIODS) {
      const start = closeOnOrBefore(series, periodStartDate(period, latest.date))
      if (start && start.close > 0) {
        returns[period] = ((latest.close - start.close) / start.close) * 100
      }
    }

    return {
      index: meta.key,
      label: meta.label,
      asOfDate: latest.date.toISOString().slice(0, 10),
      latestClose: latest.close,
      returns,
      note: PROXY_NOTE[indexKey],
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch historical data'
    return { index: meta.key, label: meta.label, asOfDate: '', latestClose: 0, returns: {}, error: message }
  }
}

export async function getAllBenchmarkReturns (): Promise<IndexReturns[]> {
  const keys = Object.keys(YAHOO_SYMBOL) as IndexKey[]
  return Promise.all(keys.map(getIndexReturns))
}
