import axios from 'axios'

export type LtpMap = Record<string, number | null>

// ── NSE India public API (no auth) ───────────────────────────────────────────
let nseSession: { cookies: string; expiry: number } | null = null

async function getNseSession (): Promise<string> {
  if (nseSession && Date.now() < nseSession.expiry) return nseSession.cookies
  const res = await axios.get('https://www.nseindia.com', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 10000,
  })
  const raw: string[] = (res.headers['set-cookie'] as string[] | undefined) ?? []
  const cookies = raw.map(c => c.split(';')[0]).join('; ')
  nseSession = { cookies, expiry: Date.now() + 10 * 60 * 1000 }
  return cookies
}

async function fetchNseLtp (symbol: string, cookies: string): Promise<number | null> {
  try {
    const { data, status } = await axios.get(`https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com',
        'Cookie': cookies,
      },
      timeout: 8000,
    })
    const ltp = (data as { priceInfo?: { lastPrice?: number } })?.priceInfo?.lastPrice ?? null
    console.log(`[NSE] ${symbol} status=${status} ltp=${ltp} keys=${Object.keys(data ?? {}).join(',')}`)
    return ltp
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown } }
    console.error(`[NSE] ${symbol} error status=${e?.response?.status}`, JSON.stringify(e?.response?.data)?.slice(0, 200))
    return null
  }
}

async function fetchViaNse (symbols: string[]): Promise<LtpMap> {
  const result: LtpMap = Object.fromEntries(symbols.map(s => [s, null]))
  try {
    const cookies = await getNseSession()
    await Promise.all(
      symbols.map(async s => {
        result[s] = await fetchNseLtp(s, cookies)
      })
    )
  } catch {
    // return nulls on session failure
  }
  return result
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function fetchLtp (symbols: string[]): Promise<{ data: LtpMap; error?: string }> {
  const data = await fetchViaNse(symbols)
  return { data }
}
