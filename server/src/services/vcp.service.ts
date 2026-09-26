import { prisma } from '../config/prisma'
import { NIFTY_50 } from './signal.service'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Candle {
  date: Date | string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface VCPContraction {
  high: number
  low: number
  rangePct: number
}

export interface VCPStockSignal {
  symbol: string
  cmp: number
  sma50: number
  sma150: number
  sma200: number
  week52High: number
  week52Low: number
  pctFrom52wHigh: number
  pctAbove52wLow: number
  trendTemplateScore: number
  trendTemplateMax: number
  contractions: VCPContraction[]
  pivot: number
  volDryUpRatio: number
  volRatioToday: number
  signal: 'BUY' | 'WATCH' | 'NO_SETUP'
  reasoning: string
  entry: number
  stopLoss: number
  target1: number
  target2: number
  riskPct: number
  t1ReturnPct: number
  t2ReturnPct: number
  holdDays: string
  error?: string
}

// ── Math helpers ──────────────────────────────────────────────────────────────

function sma(values: number[], period: number): number {
  const slice = values.slice(-period)
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

function r2(n: number) { return parseFloat(n.toFixed(2)) }

// ── Swing detection (local pivots with a 5-day window) ───────────────────────

function findSwingPivots(highs: number[], lows: number[]): Array<{ idx: number; type: 'HIGH' | 'LOW'; price: number }> {
  const pivots: Array<{ idx: number; type: 'HIGH' | 'LOW'; price: number }> = []
  const window = 5
  for (let i = window; i < highs.length - window; i++) {
    const isHigh = highs.slice(i - window, i + window + 1).every((h, j) => j === window || h <= highs[i])
    const isLow = lows.slice(i - window, i + window + 1).every((l, j) => j === window || l >= lows[i])
    if (isHigh) pivots.push({ idx: i, type: 'HIGH', price: highs[i] })
    else if (isLow) pivots.push({ idx: i, type: 'LOW', price: lows[i] })
  }
  return pivots
}

// ── VCP contraction extraction from the last ~90 trading days ────────────────

function extractContractions(candles: Candle[]): VCPContraction[] {
  const recent = candles.slice(-90)
  const highs = recent.map(c => c.high)
  const lows = recent.map(c => c.low)
  const pivots = findSwingPivots(highs, lows)

  const legs: VCPContraction[] = []
  for (let i = 0; i < pivots.length - 1; i++) {
    const a = pivots[i]
    const b = pivots[i + 1]
    if (a.type === 'HIGH' && b.type === 'LOW' && b.price < a.price) {
      legs.push({ high: r2(a.price), low: r2(b.price), rangePct: r2(((a.price - b.price) / a.price) * 100) })
    }
  }
  // A VCP base is the trailing sequence of contracting legs (most recent last)
  return legs.slice(-4)
}

function isContracting(legs: VCPContraction[]): boolean {
  if (legs.length < 2) return false
  for (let i = 1; i < legs.length; i++) {
    if (legs[i].rangePct >= legs[i - 1].rangePct) return false
  }
  return true
}

// ── Signal computation for one stock ─────────────────────────────────────────

function computeVCPSignal(symbol: string, candles: Candle[]): VCPStockSignal {
  if (candles.length < 252) {
    return { symbol, error: `Only ${candles.length} candles — need 252+` } as VCPStockSignal
  }

  const closes  = candles.map(c => c.close)
  const highs   = candles.map(c => c.high)
  const lows    = candles.map(c => c.low)
  const volumes = candles.map(c => c.volume)

  const today = candles[candles.length - 1]
  const cmp = today.close

  const sma50Val  = sma(closes, 50)
  const sma150Val = sma(closes, 150)
  const sma200Val = sma(closes, 200)
  const sma200Prior = sma(closes.slice(0, -20), 200)

  const window52w = candles.slice(-252)
  const week52High = Math.max(...window52w.map(c => c.high))
  const week52Low  = Math.min(...window52w.map(c => c.low))
  const pctFrom52wHigh = ((week52High - cmp) / week52High) * 100
  const pctAbove52wLow = ((cmp - week52Low) / week52Low) * 100

  // ── Minervini Trend Template (7 quantitative criteria) ──────────────────────
  const checks = [
    cmp > sma150Val,
    cmp > sma200Val,
    sma150Val > sma200Val,
    sma200Val > sma200Prior,               // 200DMA trending up over the last month
    sma50Val > sma150Val && sma50Val > sma200Val,
    cmp > sma50Val,
    pctAbove52wLow >= 30,
    pctFrom52wHigh <= 25,
  ]
  const trendTemplateScore = checks.filter(Boolean).length
  const trendTemplateMax = checks.length

  // ── Contractions & volume dry-up ────────────────────────────────────────────
  const contractions = extractContractions(candles)
  const contracting = isContracting(contractions)

  const vol10dRecent = sma(volumes, 10)
  const vol10dPrior  = sma(volumes.slice(0, -10), 10)
  const volDryUpRatio = vol10dPrior > 0 ? vol10dRecent / vol10dPrior : 1
  const dryUp = volDryUpRatio <= 0.75

  const vol50dAvg = sma(volumes.slice(0, -1), 50)
  const volRatioToday = vol50dAvg > 0 ? today.volume / vol50dAvg : 0

  const pivot = contractions.length > 0
    ? Math.max(...contractions.map(c => c.high))
    : week52High

  // ── Signal decision ───────────────────────────────────────────────────────
  const setupReady = trendTemplateScore >= 6 && contractions.length >= 2 && contracting && dryUp
  const breakout = setupReady && cmp > pivot && volRatioToday >= 1.4
  const nearPivot = setupReady && !breakout && cmp >= pivot * 0.97 && cmp <= pivot * 1.02

  let signal: VCPStockSignal['signal']
  let reasoning: string

  if (breakout) {
    signal = 'BUY'
    reasoning = `Trend template ${trendTemplateScore}/${trendTemplateMax} ✅. ${contractions.length} contracting legs (tightest ${contractions[contractions.length - 1].rangePct}%) with volume dry-up ${(volDryUpRatio * 100).toFixed(0)}%. Breaking pivot ₹${pivot.toFixed(0)} on ${volRatioToday.toFixed(1)}× volume surge.`
  } else if (nearPivot) {
    signal = 'WATCH'
    reasoning = `VCP base formed — ${contractions.length} contracting legs, volume dried up to ${(volDryUpRatio * 100).toFixed(0)}%. Price within range of pivot ₹${pivot.toFixed(0)}. Wait for breakout on ≥1.4× volume.`
  } else {
    signal = 'NO_SETUP'
    const why: string[] = []
    if (trendTemplateScore < 6) why.push(`Trend template only ${trendTemplateScore}/${trendTemplateMax}`)
    if (contractions.length < 2) why.push('Fewer than 2 contraction legs found')
    if (contractions.length >= 2 && !contracting) why.push('Legs not tightening (no volatility contraction)')
    if (!dryUp) why.push(`Volume not dried up (${(volDryUpRatio * 100).toFixed(0)}% of prior)`)
    reasoning = why.join(' · ')
  }

  // ── Entry / SL / Targets (Minervini-style: tight stop, let winners run) ────
  let entry = 0, stopLoss = 0, target1 = 0, target2 = 0

  if (signal === 'BUY') {
    entry = r2(pivot * 1.001)
    const baseLow = contractions.length > 0 ? contractions[contractions.length - 1].low : sma50Val
    stopLoss = r2(Math.max(baseLow, entry * 0.93)) // cap max loss at ~7%
    const risk = entry - stopLoss
    target1 = r2(entry + risk * 2)
    target2 = r2(entry + risk * 4)
  } else {
    entry = r2(cmp)
    stopLoss = r2(pivot * 0.93)
    target1 = r2(pivot)
    target2 = r2(pivot * 1.08)
  }

  const riskPct = entry > 0 ? Math.abs((entry - stopLoss) / entry * 100) : 0
  const t1ReturnPct = signal === 'BUY' ? ((target1 - entry) / entry * 100) : 0
  const t2ReturnPct = signal === 'BUY' ? ((target2 - entry) / entry * 100) : 0

  return {
    symbol,
    cmp: r2(cmp),
    sma50: r2(sma50Val),
    sma150: r2(sma150Val),
    sma200: r2(sma200Val),
    week52High: r2(week52High),
    week52Low: r2(week52Low),
    pctFrom52wHigh: r2(pctFrom52wHigh),
    pctAbove52wLow: r2(pctAbove52wLow),
    trendTemplateScore,
    trendTemplateMax,
    contractions,
    pivot: r2(pivot),
    volDryUpRatio: r2(volDryUpRatio),
    volRatioToday: r2(volRatioToday),
    signal,
    reasoning,
    entry,
    stopLoss,
    target1,
    target2,
    riskPct: r2(riskPct),
    t1ReturnPct: r2(t1ReturnPct),
    t2ReturnPct: r2(t2ReturnPct),
    holdDays: '10–40 days',
  }
}

// ── Yahoo Finance (free, no auth, 2Y daily OHLCV) ────────────────────────────

const YAHOO_OVERRIDES: Record<string, string> = {
  'M&M':   'M%26M.NS',
  'L&TFH': 'L%26TFH.NS',
}

function toYahooSym(nse: string): string {
  return YAHOO_OVERRIDES[nse] ?? `${encodeURIComponent(nse)}.NS`
}

interface YahooQuote {
  open?: (number | null)[]
  high?: (number | null)[]
  low?: (number | null)[]
  close?: (number | null)[]
  volume?: (number | null)[]
}

async function fetchYahoo(symbol: string): Promise<Candle[]> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${toYahooSym(symbol)}?interval=1d&range=2y`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Yahoo ${res.status} for ${symbol}`)

  const json = await res.json() as { chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: YahooQuote[] } }> } }
  const r = json?.chart?.result?.[0]
  if (!r?.timestamp?.length) throw new Error(`No Yahoo data for ${symbol}`)

  const q = r.indicators?.quote?.[0] ?? {}
  const candles: Candle[] = []
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = q.close?.[i]
    const h = q.high?.[i]
    const l = q.low?.[i]
    if (c == null || h == null || l == null) continue
    candles.push({
      date:   new Date(r.timestamp[i] * 1000),
      open:   q.open?.[i] ?? c,
      high:   h,
      low:    l,
      close:  c,
      volume: q.volume?.[i] ?? 0,
    })
  }
  return candles
}

async function fetchAllCandles(symbols: string[]): Promise<Map<string, Candle[]>> {
  const out   = new Map<string, Candle[]>()
  const BATCH = 10
  for (let i = 0; i < symbols.length; i += BATCH) {
    const slice = symbols.slice(i, i + BATCH)
    const res = await Promise.allSettled(slice.map(s => fetchYahoo(s).then(c => ({ s, c }))))
    for (const r of res) {
      if (r.status === 'fulfilled') out.set(r.value.s, r.value.c)
      else console.error('[vcp]', (r.reason as Error)?.message)
    }
    if (i + BATCH < symbols.length) await new Promise(ok => setTimeout(ok, 250))
  }
  return out
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateVCPSignals(userId: string): Promise<VCPStockSignal[]> {
  const candleMap = await fetchAllCandles(NIFTY_50)

  const signals: VCPStockSignal[] = []
  for (const symbol of NIFTY_50) {
    const candles = candleMap.get(symbol)
    if (!candles || candles.length < 252) {
      signals.push({ symbol, error: `Only ${candles?.length ?? 0} candles (need 252 for 52W range)`, signal: 'NO_SETUP' } as VCPStockSignal)
      continue
    }
    try {
      signals.push(computeVCPSignal(symbol, candles))
    } catch (err) {
      signals.push({ symbol, error: String(err), signal: 'NO_SETUP' } as VCPStockSignal)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).vCPSignal.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, signals },
    update: { signals, generatedAt: new Date() },
  })

  return signals
}

export async function getVCPSignalsForDate(userId: string, date: string): Promise<VCPStockSignal[] | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma as any).vCPSignal.findUnique({
    where: { userId_date: { userId, date } },
  })
  if (!row) return null
  return row.signals as VCPStockSignal[]
}

export async function listVCPSignalDates(userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).vCPSignal.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' },
    take: 30,
  })
  return rows.map((r: { date: string }) => r.date)
}
