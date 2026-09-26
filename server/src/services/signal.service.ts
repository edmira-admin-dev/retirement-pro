import { prisma } from '../config/prisma'

// ── Nifty 250 universe (Nifty 50 + Next 50 + Midcap 150) ────────────────────

export const NIFTY_50 = [
  // Nifty 50
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK',
  'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BPCL', 'BHARTIARTL',
  'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY',
  'EICHERMOT', 'GRASIM', 'HCLTECH', 'HDFCBANK', 'HEROMOTOCO',
  'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'ITC', 'INDUSINDBK',
  'INFY', 'JSWSTEEL', 'KOTAKBANK', 'LT', 'M&M',
  'MARUTI', 'NESTLEIND', 'NTPC', 'ONGC', 'POWERGRID',
  'RELIANCE', 'SBILIFE', 'SHRIRAMFIN', 'SBIN', 'SUNPHARMA',
  'TCS', 'TATACONSUM', 'TATAMOTORS', 'TATASTEEL', 'TECHM',
  'TITAN', 'TRENT', 'ULTRACEMCO', 'WIPRO', 'ZOMATO',
  // Nifty Next 50
  'ABB', 'ADANIENSOL', 'ADANIGREEN', 'ADANITRANS', 'AMBUJACEM',
  'BAJAJHFL', 'BANKBARODA', 'BERGEPAINT', 'BEL', 'BOSCHLTD',
  'CANBK', 'CHOLAFIN', 'COLPAL', 'DLF', 'GAIL',
  'GODREJCP', 'HAVELLS', 'HAL', 'ICICIPRULI', 'ICICIGI',
  'INDIANB', 'INDHOTEL', 'IOC', 'IRCTC', 'JSWENERGY',
  'LICI', 'LTIM', 'LUPIN', 'MARICO', 'MOTHERSON',
  'MUTHOOTFIN', 'NMDC', 'NYKAA', 'PAGEIND', 'PATANJALI',
  'PERSISTENT', 'PFC', 'PIDILITIND', 'PIIND', 'PNB',
  'RECLTD', 'SIEMENS', 'TATACOMM', 'TATAELXSI', 'TATAPOWER',
  'TORNTPHARM', 'TORNTPOWER', 'UNOMINDA', 'VEDL', 'ZYDUSLIFE',
  // Nifty Midcap 150 (top liquid names)
  'AARTIIND', 'ABCAPITAL', 'ABIRLANUVO', 'ACC', 'AFFLE',
  'AJANTPHARM', 'ALKEM', 'ANGELONE', 'APLAPOLLO', 'ASTRAL',
  'ATUL', 'AUBANK', 'BALKRISIND', 'BATAINDIA', 'BLUEDART',
  'BRIGADE', 'BSE', 'CARBORUNIV', 'CASTROLIND', 'CEATLTD',
  'CENTRALBK', 'CESC', 'CHALET', 'CHAMBALFERT', 'COFORGE',
  'CROMPTON', 'CUMMINSIND', 'CYIENT', 'DALBHARAT', 'DEEPAKNITR',
  'DELHIVERY', 'DIXON', 'DMART', 'EMAMILTD', 'ENDURANCE',
  'ENGINERSIN', 'ESCORTS', 'EXIDEIND', 'FIVESTAR', 'FLUOROCHEM',
  'FORTIS', 'GLENMARK', 'GMRAIRPORT', 'GNFC', 'GODREJIND',
  'GPIL', 'GRAPHITE', 'GRINDWELL', 'GUJGASLTD', 'HAPPSTMNDS',
  'HFCL', 'HINDPETRO', 'HONASA', 'HUDCO', 'IDFCFIRSTB',
  'IFCI', 'IIFL', 'INDIANHUME', 'INDIGO', 'INOXWIND',
  'IRB', 'IRFC', 'JBCHEPHARM', 'JKCEMENT', 'JKTYRE',
  'JUBLFOOD', 'JUBILANT', 'KAJARIACER', 'KALPATPOWR', 'KALYANKJIL',
  'KANSAINER', 'KAYNES', 'KFINTECH', 'KIMS', 'KNRCON',
  'KPIL', 'L&TFH', 'LATENTVIEW', 'LAURUS', 'LICHSGFIN',
  'LLOYDSENGG', 'LNTMINDTREE', 'MAHABANK', 'MAHINDRA', 'MAXHEALTH',
  'MCX', 'METROPOLIS', 'MFSL', 'MIDHANI', 'MNGL',
  'MPHASIS', 'MRF', 'NATIONALUM', 'NATCOPHARM', 'NBCC',
  'NIACL', 'NILKAMAL', 'NLCINDIA', 'NUVOCO', 'OFSS',
  'OIL', 'OLECTRA', 'ORIENTELEC', 'PGHH', 'PHOENIXLTD',
  'POLYMED', 'POLYPLEX', 'POONAWALLA', 'PRESTIGE', 'PRINCEPIPE',
  'RAIN', 'RAJESHEXPO', 'RAMCOCEM', 'RATNAMANI', 'RAYMOND',
  'RITES', 'ROUTE', 'SAFARI', 'SANOFI', 'SAPPHIRE',
  'SCI', 'SEQUENT', 'SHYAMMETL', 'SIGNATURE', 'SKFINDIA',
  'SOBHA', 'SONACOMS', 'SPARC', 'STARHEALTH', 'STLTECH',
  'SUBROS', 'SUMICHEM', 'SUNTECK', 'SUPREMEIND', 'SUZLON',
  'SYNGENE', 'TANLA', 'TARSONS', 'TASTYBITE', 'TEJASNET',
  'THERMAX', 'TIMKEN', 'TITAGARH', 'TRIDENT', 'TVSHLTD',
  'UBL', 'UCOBANK', 'UJJIVANSFB', 'UNIONBANK', 'UNOMINDA',
  'UTIAMC', 'VAIBHAVGBL', 'VSTIND', 'WELCORP', 'WHIRLPOOL',
  'WIPRO', 'WONDERLA', 'YESBANK', 'ZEEL', 'ZENSARTECH',
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface Candle {
  date: Date | string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockSignal {
  symbol: string
  cmp: number
  pdh: number
  pdl: number
  pdc: number
  ema20: number
  ema50: number
  ema200: number
  rsi: number
  atr: number
  atrPct: number
  vol20dAvg: number
  volToday: number
  volRatio: number
  l1Trend: 'BULL_FULL' | 'BULL_PARTIAL' | 'BEAR_FULL' | 'BEAR_PARTIAL' | 'NEUTRAL'
  l2Volume: 'STRONG' | 'GOOD' | 'ACCEPTABLE' | 'WEAK'
  l3Structure: string
  l4PA: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  signal: 'BUY' | 'SHORT' | 'WATCH' | 'NO_TRADE'
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
  outcome?: SignalOutcome
}

export interface SignalOutcome {
  status: 'OPEN' | 'WIN_T1' | 'WIN_T2' | 'LOSS' | 'EXPIRED'
  evaluatedAt: string
  exitPrice?: number
  exitDate?: string
  daysHeld?: number
}

// ── Math helpers ──────────────────────────────────────────────────────────────

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]
  const k = 2 / (period + 1)
  // Seed with SMA of first `period` values
  let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  return ema
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period
  // Wilder smoothing
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period
    }
  }
  if (avgLoss === 0) return 100
  return 100 - 100 / (1 + avgGain / avgLoss)
}

function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  const trs: number[] = []
  for (let i = 1; i < closes.length; i++) {
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ))
  }
  const slice = trs.slice(-period)
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

function avg20Vol(volumes: number[]): number {
  const slice = volumes.slice(-21, -1) // last 20 complete days
  return slice.reduce((s, v) => s + v, 0) / slice.length
}

function r2(n: number) { return parseFloat(n.toFixed(2)) }

// ── Signal computation for one stock ─────────────────────────────────────────

function computeSignal(symbol: string, candles: Candle[]): StockSignal {
  if (candles.length < 202) {
    return { symbol, error: `Only ${candles.length} candles — need 202+` } as StockSignal
  }

  const closes  = candles.map(c => c.close)
  const highs   = candles.map(c => c.high)
  const lows    = candles.map(c => c.low)
  const volumes = candles.map(c => c.volume)

  const prev  = candles[candles.length - 2]
  const today = candles[candles.length - 1]

  const cmp = today.close
  const pdh = prev.high
  const pdl = prev.low
  const pdc = prev.close

  // Indicators
  const e20     = calcEMA(closes, 20)
  const e50     = calcEMA(closes, 50)
  const e200    = calcEMA(closes, 200)
  const rsiVal  = calcRSI(closes)
  const atrVal  = calcATR(highs, lows, closes)
  const atrPct  = (atrVal / cmp) * 100
  const v20avg  = avg20Vol(volumes)
  const volToday = today.volume
  const volRatio = v20avg > 0 ? volToday / v20avg : 0

  // ATR filter: 1.2%–2.5% sweet spot
  const atrInRange = atrPct >= 1.2 && atrPct <= 2.5

  // ── Layer 1: Trend ────────────────────────────────────────────────────────
  const fullBull    = cmp > e20 && e20 > e50 && e50 > e200
  const partialBull = cmp > e20 && e20 > e50
  const fullBear    = cmp < e20 && e20 < e50 && e50 < e200
  const partialBear = cmp < e20 && e20 < e50

  let l1Trend: StockSignal['l1Trend']
  if (fullBull)         l1Trend = 'BULL_FULL'
  else if (partialBull) l1Trend = 'BULL_PARTIAL'
  else if (fullBear)    l1Trend = 'BEAR_FULL'
  else if (partialBear) l1Trend = 'BEAR_PARTIAL'
  else                  l1Trend = 'NEUTRAL'

  // ── Layer 2: Volume ───────────────────────────────────────────────────────
  let l2Volume: StockSignal['l2Volume']
  if (volRatio >= 3.0)      l2Volume = 'STRONG'
  else if (volRatio >= 2.0) l2Volume = 'GOOD'
  else if (volRatio >= 1.5) l2Volume = 'ACCEPTABLE'
  else                      l2Volume = 'WEAK'

  const volPass = volRatio >= 1.5

  // ── Layer 3: Structure ────────────────────────────────────────────────────
  const h52w = Math.max(...highs.slice(-252))
  const l52w = Math.min(...lows.slice(-252))
  const pctFrom52wH = ((h52w - cmp) / h52w) * 100
  const pctFrom52wL = ((cmp - l52w) / l52w) * 100
  const parts: string[] = [`PDH ₹${pdh.toFixed(0)} · PDL ₹${pdl.toFixed(0)}`]
  if (pctFrom52wH <= 3) parts.push('Near 52W High 🔥')
  if (pctFrom52wL <= 3) parts.push('Near 52W Low ⚠️')
  // Breakout check: today closed above PDH
  if (cmp > pdh) parts.push('Breaking out above PDH ✅')
  const l3Structure = parts.join(' | ')

  // ── Layer 4: Price Action (RSI proxy for VWAP alignment) ─────────────────
  const bullPA = rsiVal >= 50 && rsiVal <= 70
  const bearPA = rsiVal >= 30 && rsiVal <= 50
  const l4PA: StockSignal['l4PA'] = bullPA ? 'BULLISH' : bearPA ? 'BEARISH' : 'NEUTRAL'

  // ── Signal decision ───────────────────────────────────────────────────────
  let signal: StockSignal['signal']
  let reasoning = ''

  const longSetup  = (fullBull || partialBull) && volPass && bullPA && atrInRange
  const shortSetup = (fullBear || partialBear) && volPass && bearPA && atrInRange
  const watchLong  = (fullBull || partialBull) && !volPass && bullPA

  if (longSetup) {
    signal = 'BUY'
    reasoning = `${fullBull ? 'Full' : 'Partial'} bull trend (EMA20 ${fullBull ? '> EMA50 > EMA200' : '> EMA50'}). Volume ${volRatio.toFixed(1)}× avg (Layer 2 ✅). RSI ${rsiVal.toFixed(0)} in buy zone 50–70 (Layer 4 ✅). Entry above PDH ₹${pdh.toFixed(0)}.`
  } else if (shortSetup) {
    signal = 'SHORT'
    reasoning = `${fullBear ? 'Full' : 'Partial'} bear trend. Volume ${volRatio.toFixed(1)}× avg ✅. RSI ${rsiVal.toFixed(0)} in short zone 30–50 ✅. Entry below PDL ₹${pdl.toFixed(0)}.`
  } else if (watchLong) {
    signal = 'WATCH'
    reasoning = `Uptrend intact but volume only ${volRatio.toFixed(1)}× avg (need ≥1.5×). Wait for volume surge. Alert above PDH ₹${pdh.toFixed(0)} with vol > 1.5× avg.`
  } else {
    signal = 'NO_TRADE'
    const why: string[] = []
    if (!fullBull && !partialBull && !fullBear && !partialBear) why.push('No clear EMA trend')
    if (!volPass) why.push(`Low volume (${volRatio.toFixed(1)}× — need 1.5×)`)
    if (!bullPA && !bearPA) why.push(`RSI ${rsiVal.toFixed(0)} in neutral zone`)
    if (!atrInRange) why.push(`ATR ${atrPct.toFixed(1)}% outside 1.2–2.5% sweet spot`)
    reasoning = why.join(' · ')
  }

  // ── Entry / SL / Targets ──────────────────────────────────────────────────
  let entry = 0, stopLoss = 0, target1 = 0, target2 = 0

  if (signal === 'BUY') {
    entry    = r2(pdh * 1.0015)
    stopLoss = r2(Math.max(pdl, e20 * 0.99))
    const risk = entry - stopLoss
    target1  = r2(entry + risk * 1.5)
    target2  = r2(entry + risk * 2.5)
  } else if (signal === 'SHORT') {
    entry    = r2(pdl * 0.9985)
    stopLoss = r2(Math.min(pdh, e20 * 1.01))
    const risk = stopLoss - entry
    target1  = r2(entry - risk * 1.5)
    target2  = r2(entry - risk * 2.5)
  } else {
    entry    = r2(cmp)
    stopLoss = r2(signal === 'WATCH' ? pdl : e20 * 0.98)
    target1  = r2(pdh)
    target2  = r2(pdh * 1.03)
  }

  const riskPct      = entry > 0 ? Math.abs((entry - stopLoss) / entry * 100) : 0
  const t1ReturnPct  = signal === 'BUY'   ? ((target1 - entry) / entry * 100) :
                       signal === 'SHORT'  ? ((entry - target1) / entry * 100) : 0
  const t2ReturnPct  = signal === 'BUY'   ? ((target2 - entry) / entry * 100) :
                       signal === 'SHORT'  ? ((entry - target2) / entry * 100) : 0

  return {
    symbol,
    cmp:        r2(cmp),
    pdh:        r2(pdh),
    pdl:        r2(pdl),
    pdc:        r2(pdc),
    ema20:      r2(e20),
    ema50:      r2(e50),
    ema200:     r2(e200),
    rsi:        r2(rsiVal),
    atr:        r2(atrVal),
    atrPct:     r2(atrPct),
    vol20dAvg:  Math.round(v20avg),
    volToday,
    volRatio:   r2(volRatio),
    l1Trend,
    l2Volume,
    l3Structure,
    l4PA,
    signal,
    reasoning,
    entry,
    stopLoss,
    target1,
    target2,
    riskPct:     r2(riskPct),
    t1ReturnPct: r2(t1ReturnPct),
    t2ReturnPct: r2(t2ReturnPct),
    holdDays:   '2–10 days',
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
      else console.error('[signal]', (r.reason as Error)?.message)
    }
    if (i + BATCH < symbols.length) await new Promise(ok => setTimeout(ok, 250))
  }
  return out
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateSignals(userId: string): Promise<StockSignal[]> {
  const candleMap = await fetchAllCandles(NIFTY_50)

  const signals: StockSignal[] = []
  for (const symbol of NIFTY_50) {
    const candles = candleMap.get(symbol)
    if (!candles || candles.length < 202) {
      signals.push({ symbol, error: `Only ${candles?.length ?? 0} candles (need 202 for EMA200)`, signal: 'NO_TRADE' } as StockSignal)
      continue
    }
    try {
      signals.push(computeSignal(symbol, candles))
    } catch (err) {
      signals.push({ symbol, error: String(err), signal: 'NO_TRADE' } as StockSignal)
    }
  }

  // Persist for the day
  const today = new Date().toISOString().slice(0, 10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).tradeSignal.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, broker: 'YAHOO', signals },
    update: { signals, generatedAt: new Date() },
  })

  return signals
}

export async function getSignalsForDate(userId: string, date: string): Promise<StockSignal[] | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma as any).tradeSignal.findUnique({
    where: { userId_date: { userId, date } },
  })
  if (!row) return null
  return row.signals as StockSignal[]
}

// ── Outcome evaluation ────────────────────────────────────────────────────────

const MAX_HOLD_TRADING_DAYS = 15

function dateKey(d: Date | string): string {
  return (typeof d === 'string' ? new Date(d) : d).toISOString().slice(0, 10)
}

function evaluateOneSignal(sig: StockSignal, signalDate: string, candles: Candle[]): SignalOutcome | null {
  const future = candles.filter(c => dateKey(c.date) > signalDate).sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)))
  if (future.length === 0) return null // no new data since signal — leave OPEN

  let status: SignalOutcome['status'] = 'OPEN'
  let exitPrice: number | undefined
  let exitDate: string | undefined

  for (let i = 0; i < future.length; i++) {
    const c = future[i]
    if (c.low <= sig.stopLoss) {
      status = 'LOSS'
      exitPrice = sig.stopLoss
      exitDate = dateKey(c.date)
      break
    }
    if (c.high >= sig.target2) {
      status = 'WIN_T2'
      exitPrice = sig.target2
      exitDate = dateKey(c.date)
      break
    }
    if (c.high >= sig.target1 && status === 'OPEN') {
      status = 'WIN_T1'
      exitPrice = sig.target1
      exitDate = dateKey(c.date)
      // keep scanning — a later day may still hit target2 and upgrade the outcome
    }
  }

  if (status === 'OPEN') {
    if (future.length >= MAX_HOLD_TRADING_DAYS) {
      return {
        status: 'EXPIRED',
        evaluatedAt: new Date().toISOString(),
        exitPrice: r2(future[future.length - 1].close),
        exitDate: dateKey(future[future.length - 1].date),
        daysHeld: future.length,
      }
    }
    return null // still open, not enough days elapsed to expire
  }

  const daysHeld = future.findIndex(c => dateKey(c.date) === exitDate) + 1
  return { status, evaluatedAt: new Date().toISOString(), exitPrice, exitDate, daysHeld }
}

export async function evaluateOutcomes(userId: string): Promise<{ rowsUpdated: number; signalsEvaluated: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).tradeSignal.findMany({ where: { userId }, orderBy: { date: 'asc' } })

  const pending = rows.filter((row: { signals: StockSignal[] }) =>
    (row.signals as StockSignal[]).some(s => s.signal === 'BUY' && (!s.outcome || s.outcome.status === 'OPEN'))
  )
  if (pending.length === 0) return { rowsUpdated: 0, signalsEvaluated: 0 }

  const symbols = Array.from(new Set(
    pending.flatMap((row: { signals: StockSignal[] }) =>
      (row.signals as StockSignal[]).filter(s => s.signal === 'BUY' && (!s.outcome || s.outcome.status === 'OPEN')).map(s => s.symbol)
    )
  )) as string[]

  const candleMap = await fetchAllCandles(symbols)

  let rowsUpdated = 0
  let signalsEvaluated = 0

  for (const row of pending) {
    const signals = row.signals as StockSignal[]
    let changed = false

    for (const sig of signals) {
      if (sig.signal !== 'BUY' || (sig.outcome && sig.outcome.status !== 'OPEN')) continue
      const candles = candleMap.get(sig.symbol)
      if (!candles) continue
      const outcome = evaluateOneSignal(sig, row.date, candles)
      if (outcome) {
        sig.outcome = outcome
        changed = true
        signalsEvaluated++
      }
    }

    if (changed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).tradeSignal.update({ where: { id: row.id }, data: { signals } })
      rowsUpdated++
    }
  }

  return { rowsUpdated, signalsEvaluated }
}

export interface SignalSuccessStats {
  total: number
  wins: number
  losses: number
  open: number
  expired: number
  winRatePct: number
  avgT1ReturnPct: number
  avgT2ReturnPct: number
  bySymbol: Array<{ symbol: string; total: number; wins: number; losses: number; winRatePct: number }>
}

export async function getSuccessStats(userId: string): Promise<SignalSuccessStats> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).tradeSignal.findMany({ where: { userId }, select: { signals: true } })

  const buySignals = rows.flatMap((row: { signals: StockSignal[] }) => (row.signals as StockSignal[]).filter(s => s.signal === 'BUY'))

  let wins = 0, losses = 0, open = 0, expired = 0
  let t1Sum = 0, t1Count = 0, t2Sum = 0, t2Count = 0
  const bySymbolMap = new Map<string, { total: number; wins: number; losses: number }>()

  for (const sig of buySignals) {
    const status = sig.outcome?.status ?? 'OPEN'
    const bucket = bySymbolMap.get(sig.symbol) ?? { total: 0, wins: 0, losses: 0 }
    bucket.total++

    if (status === 'WIN_T1') { wins++; bucket.wins++; t1Sum += sig.t1ReturnPct; t1Count++ }
    else if (status === 'WIN_T2') { wins++; bucket.wins++; t2Sum += sig.t2ReturnPct; t2Count++ }
    else if (status === 'LOSS') { losses++; bucket.losses++ }
    else if (status === 'EXPIRED') expired++
    else open++

    bySymbolMap.set(sig.symbol, bucket)
  }

  const decided = wins + losses
  const bySymbol = Array.from(bySymbolMap.entries())
    .map(([symbol, b]) => ({
      symbol,
      total: b.total,
      wins: b.wins,
      losses: b.losses,
      winRatePct: b.wins + b.losses > 0 ? r2((b.wins / (b.wins + b.losses)) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    total: buySignals.length,
    wins,
    losses,
    open,
    expired,
    winRatePct: decided > 0 ? r2((wins / decided) * 100) : 0,
    avgT1ReturnPct: t1Count > 0 ? r2(t1Sum / t1Count) : 0,
    avgT2ReturnPct: t2Count > 0 ? r2(t2Sum / t2Count) : 0,
    bySymbol,
  }
}

export async function listSignalDates(userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).tradeSignal.findMany({
    where: { userId },
    select: { date: true, generatedAt: true },
    orderBy: { date: 'desc' },
    take: 30,
  })
  return rows.map((r: { date: string }) => r.date)
}
