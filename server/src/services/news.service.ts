import axios from 'axios'
import { getHoldings } from './equity-holdings.service'
import { getMarketPulse, MarketPulse } from './market-pulse.service'
import { getMajorEvents, TeEvent } from './te-news.service'

export interface CorpAction {
  symbol: string
  companyName: string
  subject: string
  exDate: string
  recordDate: string
}

export interface ResultDate {
  symbol: string
  companyName: string
  date: string
  purpose: string
}

export interface BookRow {
  symbol: string
  companyName: string
  weightPct: number
  dayChangePct: number
}

export interface WatchEvent {
  symbol: string
  companyName: string
  type: 'RESULTS' | 'CORP_ACTION'
  date: string
  detail: string
}

export interface DashboardResponse {
  marketPulse: MarketPulse
  book: BookRow[]
  watch: WatchEvent[]
  macro: TeEvent[]
  fetchedAt: string
}

// ── NSE corporate actions & results calendar (public, no auth) ──────────────
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

async function fetchNse<T> (path: string): Promise<T[]> {
  try {
    const cookies = await getNseSession()
    const { data } = await axios.get(`https://www.nseindia.com${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com',
        'Cookie': cookies,
      },
      timeout: 10000,
    })
    return (data as T[]) ?? []
  } catch (err) {
    console.error(`[news] NSE fetch error ${path}`, (err as Error).message)
    return []
  }
}

let corpActionsCache: { items: CorpAction[]; fetchedAt: number } | null = null
let resultsCache: { items: ResultDate[]; fetchedAt: number } | null = null

async function loadCorpActions (): Promise<CorpAction[]> {
  const rows = await fetchNse<Record<string, string>>('/api/corporates-corporateActions?index=equities')
  const items = rows.map(row => ({
    symbol: row['symbol'] ?? '',
    companyName: row['comp'] ?? '',
    subject: row['subject'] ?? '',
    exDate: row['exDate'] ?? '',
    recordDate: row['recDate'] ?? '',
  }))
  corpActionsCache = { items, fetchedAt: Date.now() }
  return items
}

async function loadResultsCalendar (): Promise<ResultDate[]> {
  const rows = await fetchNse<Record<string, string>>('/api/corporate-results?index=equities')
  const items = rows.map(row => ({
    symbol: row['symbol'] ?? '',
    companyName: row['comp'] ?? row['companyName'] ?? '',
    date: row['bm_date'] ?? row['bm_timestamp'] ?? '',
    purpose: row['purpose'] ?? row['bm_desc'] ?? 'Board Meeting / Results',
  }))
  resultsCache = { items, fetchedAt: Date.now() }
  return items
}

function buildBook (holdings: Array<{ symbol: string; companyName: string; portfolioWeightPct: number; dayChangePct: number }>): BookRow[] {
  return holdings
    .map(h => ({
      symbol: h.symbol,
      companyName: h.companyName,
      weightPct: h.portfolioWeightPct,
      dayChangePct: h.dayChangePct,
    }))
    .sort((a, b) => b.weightPct - a.weightPct)
}

function buildWatch (holdings: Array<{ symbol: string; companyName: string }>, corpActions: CorpAction[], results: ResultDate[]): WatchEvent[] {
  const symbols = new Set(holdings.map(h => h.symbol))
  const nameBySymbol = new Map(holdings.map(h => [h.symbol, h.companyName]))
  const events: WatchEvent[] = []
  for (const a of corpActions) {
    if (symbols.has(a.symbol)) {
      events.push({ symbol: a.symbol, companyName: nameBySymbol.get(a.symbol) ?? a.companyName, type: 'CORP_ACTION', date: a.exDate, detail: a.subject })
    }
  }
  for (const r of results) {
    if (symbols.has(r.symbol)) {
      events.push({ symbol: r.symbol, companyName: nameBySymbol.get(r.symbol) ?? r.companyName, type: 'RESULTS', date: r.date, detail: r.purpose })
    }
  }
  return events
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getDashboard (userId: string, forceRefresh = false): Promise<DashboardResponse> {
  const holdings = await getHoldings(userId)

  const [corpActions, results, marketPulse, macro] = await Promise.all([
    (forceRefresh || !corpActionsCache) ? loadCorpActions() : Promise.resolve(corpActionsCache.items),
    (forceRefresh || !resultsCache) ? loadResultsCalendar() : Promise.resolve(resultsCache.items),
    getMarketPulse(forceRefresh),
    getMajorEvents(forceRefresh),
  ])

  const book = buildBook(holdings)
  const watch = buildWatch(holdings, corpActions, results)

  return {
    marketPulse,
    book,
    watch,
    macro,
    fetchedAt: new Date().toISOString(),
  }
}
