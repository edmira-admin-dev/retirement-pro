import axios from 'axios'

export interface PulseTile {
  label: string
  value: string
  changePct: number | null
}

export interface FiiDii {
  date: string
  fiiNetCr: number
  diiNetCr: number
}

export interface MarketPulse {
  indices: PulseTile[]
  global: PulseTile[]
  currency: PulseTile[]
  commodity: PulseTile[]
  yields: PulseTile[]
  fiiDii: FiiDii | null
}

interface YahooTicker {
  label: string
  symbol: string
  decimals: number
  suffix?: string
}

const INDIA_INDICES: YahooTicker[] = [
  { label: 'NIFTY 50', symbol: '^NSEI', decimals: 0 },
  { label: 'SENSEX', symbol: '^BSESN', decimals: 0 },
  { label: 'BANK NIFTY', symbol: '^NSEBANK', decimals: 0 },
  { label: 'INDIA VIX', symbol: '^INDIAVIX', decimals: 2 },
]

const GLOBAL_INDICES: YahooTicker[] = [
  { label: 'S&P 500', symbol: '^GSPC', decimals: 0 },
  { label: 'DOW', symbol: '^DJI', decimals: 0 },
  { label: 'NASDAQ', symbol: '^IXIC', decimals: 0 },
  { label: 'NIKKEI 225', symbol: '^N225', decimals: 0 },
  { label: 'HANG SENG', symbol: '^HSI', decimals: 0 },
]

const CURRENCY: YahooTicker[] = [
  { label: 'USD/INR', symbol: 'INR=X', decimals: 2 },
  { label: 'DXY', symbol: 'DX-Y.NYB', decimals: 2 },
]

const COMMODITY: YahooTicker[] = [
  { label: 'Brent Crude', symbol: 'BZ=F', decimals: 2, suffix: '/bbl' },
  { label: 'Gold', symbol: 'GC=F', decimals: 0, suffix: '/oz' },
]

const YIELDS: YahooTicker[] = [
  { label: 'US 10Y', symbol: '^TNX', decimals: 2, suffix: '%' },
]

async function fetchYahooTile (ticker: YahooTicker): Promise<PulseTile | null> {
  try {
    const { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker.symbol)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
      timeout: 8000,
    })
    const meta = (data as { chart?: { result?: Array<{ meta?: Record<string, number> }> } })?.chart?.result?.[0]?.meta
    const price = meta?.['regularMarketPrice']
    const prevClose = meta?.['previousClose'] ?? meta?.['chartPreviousClose']
    if (price == null) return null
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : null
    const displayValue = ticker.symbol === '^TNX' ? (price).toFixed(ticker.decimals) : price.toLocaleString('en-IN', { maximumFractionDigits: ticker.decimals })
    return {
      label: ticker.label,
      value: `${displayValue}${ticker.suffix ?? ''}`,
      changePct: changePct == null ? null : Math.round(changePct * 100) / 100,
    }
  } catch (err) {
    console.error(`[market-pulse] ${ticker.label} fetch error`, (err as Error).message)
    return null
  }
}

async function fetchTiles (tickers: YahooTicker[]): Promise<PulseTile[]> {
  const results = await Promise.all(tickers.map(fetchYahooTile))
  return results.filter((t): t is PulseTile => t !== null)
}

// ── FII/DII provisional cash-market flows (NSE public, no auth) ──────────────
let nseSession: { cookies: string; expiry: number } | null = null

async function getNseSession (): Promise<string> {
  if (nseSession && Date.now() < nseSession.expiry) return nseSession.cookies
  const res = await axios.get('https://www.nseindia.com', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: 10000,
  })
  const raw: string[] = (res.headers['set-cookie'] as string[] | undefined) ?? []
  const cookies = raw.map(c => c.split(';')[0]).join('; ')
  nseSession = { cookies, expiry: Date.now() + 10 * 60 * 1000 }
  return cookies
}

async function fetchFiiDii (): Promise<FiiDii | null> {
  try {
    const cookies = await getNseSession()
    const { data } = await axios.get('https://www.nseindia.com/api/fiidiiTradeReact', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com',
        'Cookie': cookies,
      },
      timeout: 8000,
    })
    const rows = data as Array<{ category: string; date: string; buyValue: string; sellValue: string; netValue: string }>
    const fii = rows.find(r => /FII|FPI/i.test(r.category))
    const dii = rows.find(r => /DII/i.test(r.category))
    if (!fii || !dii) return null
    return {
      date: fii.date,
      fiiNetCr: Math.round(parseFloat(fii.netValue) * 100) / 100,
      diiNetCr: Math.round(parseFloat(dii.netValue) * 100) / 100,
    }
  } catch (err) {
    console.error('[market-pulse] fii/dii fetch error', (err as Error).message)
    return null
  }
}

let pulseCache: { data: MarketPulse; fetchedAt: number } | null = null

export async function getMarketPulse (forceRefresh = false): Promise<MarketPulse> {
  if (!forceRefresh && pulseCache) return pulseCache.data

  const [indices, global, currency, commodity, yields, fiiDii] = await Promise.all([
    fetchTiles(INDIA_INDICES),
    fetchTiles(GLOBAL_INDICES),
    fetchTiles(CURRENCY),
    fetchTiles(COMMODITY),
    fetchTiles(YIELDS),
    fetchFiiDii(),
  ])

  const data: MarketPulse = { indices, global, currency, commodity, yields, fiiDii }
  pulseCache = { data, fetchedAt: Date.now() }
  return data
}
