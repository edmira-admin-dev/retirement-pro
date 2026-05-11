import { Holding } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

function toSerialized(h: Holding) {
  return { ...h, currentValue: Number(h.currentValue), investedValue: Number(h.investedValue) }
}

const BASE_URL = 'https://api.groww.in'

// ── Types ──────────────────────────────────────────────────────────────────────

interface GrowwResponse<T> {
  status: 'SUCCESS' | 'FAILURE'
  payload: T
  errorMessage?: string
}

interface GrowwHolding {
  trading_symbol?: string
  tradingsymbol?: string
  exchange?: string
  net_quantity?: number
  quantity?: number
  average_price: number
  isin?: string
}

interface GrowwHoldingsPayload {
  holdings?: GrowwHolding[]
  holdingData?: GrowwHolding[]
}

interface GrowwOrder {
  trading_symbol: string
  exchange?: string
  transaction_type: 'BUY' | 'SELL'
  quantity: number
  price: number
  average_price?: number
  order_status: string
  order_timestamp: string
  groww_order_id?: string
}

interface GrowwOrdersPayload {
  orders?: GrowwOrder[]
}

interface StoredCreds {
  accessToken?: string
  tokenGeneratedAt?: number  // epoch ms
}

function getEnvApiKey (): string {
  const key = process.env.GROWW_API_KEY
  if (!key) throw new AppError(500, 'GROWW_API_KEY not set in server environment')
  return key
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseCreds (credJson: string | null | undefined): StoredCreds | null {
  if (!credJson) return null
  try {
    return JSON.parse(credJson) as StoredCreds
  } catch {
    return null
  }
}

function isTokenExpired (tokenGeneratedAt: number | undefined): boolean {
  if (!tokenGeneratedAt) return true
  const generated = new Date(tokenGeneratedAt)
  const now = new Date()

  // Tokens expire at 06:00 AM IST (00:30 UTC) — if generated before today's 6 AM, expired
  const todaySixAm = new Date()
  todaySixAm.setUTCHours(0, 30, 0, 0) // 06:00 IST = 00:30 UTC

  // If current time is past today's 6 AM and token was generated before that, expired
  if (now >= todaySixAm && generated < todaySixAm) return true

  // If both generated and now are before today's 6 AM but on a different day (yesterday), expired
  if (generated < todaySixAm && now < todaySixAm) {
    const yesterdaySixAm = new Date(todaySixAm.getTime() - 24 * 60 * 60 * 1000)
    if (generated < yesterdaySixAm) return true
  }

  return false
}

// If the env value is already a JWT (3 base64 parts), return it directly
function isJwt (s: string): boolean {
  const parts = s.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}

async function generateToken (apiKey: string): Promise<string> {
  // GROWW_API_KEY may be a pre-generated session JWT — use it directly
  if (isJwt(apiKey)) return apiKey

  const res = await fetch(`${BASE_URL}/v1/login/api/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ api_key: apiKey })
  })

  if (res.status === 401 || res.status === 403)
    throw new AppError(
      401,
      'Groww token generation failed — ensure you have approved the API key on groww.in today'
    )
  if (!res.ok)
    throw new AppError(502, `Groww auth error: ${res.status} ${res.statusText}`)

  const json = (await res.json()) as GrowwResponse<{ access_token: string }>
  if (json.status !== 'SUCCESS' || !json.payload?.access_token)
    throw new AppError(400, json.errorMessage ?? 'Groww token generation failed')

  return json.payload.access_token
}

async function growwGet<T> (token: string, path: string): Promise<T> {
  console.log(`[Groww] GET ${BASE_URL}${path} | token: ${token.slice(0, 20)}...`)
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'X-API-VERSION': '1.0'
    }
  })

  if (res.status === 401 || res.status === 403)
    throw new AppError(401, 'Groww session expired — refresh token to continue')
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new AppError(502, `Groww API error: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`)
  }

  const json = (await res.json()) as GrowwResponse<T>
  if (json.status !== 'SUCCESS')
    throw new AppError(502, json.errorMessage ?? 'Groww API returned failure')

  return json.payload
}

// ── Holdings (DB only — GROWW-tagged) ─────────────────────────────────────────

export async function getHoldings(userId: string) {
  const rows = await prisma.holding.findMany({
    where: { userId, assetClass: 'STOCK', deletedAt: null, notes: { contains: '"source":"GROWW"' } },
    orderBy: { createdAt: 'desc' }
  })
  return rows.map(toSerialized)
}

// ── Connect (reads API key from env, generates first token) ──────────────────

export async function connect (userId: string): Promise<void> {
  const apiKey = getEnvApiKey()
  const accessToken = await generateToken(apiKey)

  await prisma.brokerConnection.upsert({
    where: { userId_broker: { userId, broker: 'GROWW' } },
    create: {
      userId,
      broker: 'GROWW',
      connectionType: 'API',
      status: 'CONNECTED',
      credentialsJson: JSON.stringify({
        accessToken,
        tokenGeneratedAt: Date.now()
      } satisfies StoredCreds)
    },
    update: {
      status: 'CONNECTED',
      credentialsJson: JSON.stringify({
        accessToken,
        tokenGeneratedAt: Date.now()
      } satisfies StoredCreds),
      errorMessage: null,
      deletedAt: null
    }
  })
}

// ── Refresh token (called daily before sync if expired) ───────────────────────

export async function refreshToken (userId: string): Promise<void> {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'GROWW' } }
  })
  if (!row) throw new AppError(404, 'Groww not connected — connect first')

  const apiKey = getEnvApiKey()
  const creds = parseCreds(row.credentialsJson) ?? {}
  const accessToken = await generateToken(apiKey)

  await prisma.brokerConnection.update({
    where: { userId_broker: { userId, broker: 'GROWW' } },
    data: {
      status: 'CONNECTED',
      credentialsJson: JSON.stringify({
        ...creds,
        accessToken,
        tokenGeneratedAt: Date.now()
      } satisfies StoredCreds),
      errorMessage: null
    }
  })
}

// ── Status ─────────────────────────────────────────────────────────────────────

export async function getStatus (userId: string) {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'GROWW' } },
    select: {
      status: true,
      lastSyncedAt: true,
      tradesSynced: true,
      duplicatesSkipped: true,
      errorMessage: true,
      deletedAt: true,
      credentialsJson: true
    }
  })

  if (!row || row.deletedAt)
    return { connected: false, lastSyncedAt: null, syncSummary: null, errorMessage: null, tokenExpired: false }

  const creds = parseCreds(row.credentialsJson)
  const tokenExpired = isTokenExpired(creds?.tokenGeneratedAt)

  return {
    connected: row.status === 'CONNECTED',
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    syncSummary:
      row.status === 'CONNECTED'
        ? { holdingsSynced: 0, tradesSynced: row.tradesSynced, duplicatesSkipped: row.duplicatesSkipped }
        : null,
    errorMessage: row.errorMessage ?? null,
    tokenExpired
  }
}

// ── Sync ───────────────────────────────────────────────────────────────────────

export async function sync (userId: string) {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'GROWW' } }
  })

  if (!row || row.status !== 'CONNECTED')
    throw new AppError(400, 'Groww not connected')

  const creds = parseCreds(row.credentialsJson)
  if (!creds?.accessToken)
    throw new AppError(401, 'Groww token missing — refresh token to continue')

  // Auto-refresh if expired
  let { accessToken } = creds
  if (isTokenExpired(creds.tokenGeneratedAt)) {
    try {
      const newToken = await generateToken(getEnvApiKey())
      accessToken = newToken
      await prisma.brokerConnection.update({
        where: { userId_broker: { userId, broker: 'GROWW' } },
        data: {
          credentialsJson: JSON.stringify({ ...creds, accessToken: newToken, tokenGeneratedAt: Date.now() })
        }
      })
    } catch {
      throw new AppError(
        401,
        'Groww token expired — approve API key on groww.in today, then refresh token'
      )
    }
  }

  const errors: string[] = []
  let holdingsSynced = 0
  let tradesSynced = 0
  let tradesSkipped = 0

  // ── Holdings ────────────────────────────────────────────────────────────────
  try {
    const data = await growwGet<GrowwHoldingsPayload>(accessToken, '/v1/holdings/user').catch((err: unknown) => {
      // Groww returns 404 when demat account has no holdings — treat as empty
      if (err instanceof AppError && err.message.includes('404')) return { holdingData: [], holdings: [] } as GrowwHoldingsPayload
      throw err
    })
    const holdingsList = data.holdingData ?? data.holdings ?? []

    // Batch-fetch live LTP for all held symbols
    const ltpMap: Record<string, number> = {}
    if (holdingsList.length > 0) {
      const exchangeSymbols = holdingsList
        .map((h) => {
          const sym = h.trading_symbol ?? h.tradingsymbol
          const exch = h.exchange?.toUpperCase() === 'BSE' ? 'BSE' : 'NSE'
          return sym ? `${exch}_${sym}` : null
        })
        .filter(Boolean)
        .join(',')
      try {
        const ltpData = await growwGet<Record<string, number>>(
          accessToken,
          `/v1/live-data/ltp?segment=CASH&exchange_symbols=${exchangeSymbols}`
        )
        Object.assign(ltpMap, ltpData)
      } catch {
        // LTP fetch failed — currentValue will fall back to average_price
      }
    }

    for (const h of holdingsList) {
      const symbol = h.trading_symbol ?? h.tradingsymbol
      const qty = h.net_quantity ?? h.quantity ?? 0
      if (!symbol || qty <= 0) continue
      const exchange = h.exchange?.toUpperCase() === 'BSE' ? 'BSE' : 'NSE'
      const investedValue = BigInt(Math.round(h.average_price * qty * 100))
      const ltp = ltpMap[`${exchange}_${symbol}`] ?? h.average_price
      const currentValue = BigInt(Math.round(ltp * qty * 100))

      const existing = await prisma.holding.findFirst({
        where: { userId, name: symbol, assetClass: 'STOCK', deletedAt: null, notes: { contains: '"source":"GROWW"' } }
      })

      if (existing) {
        await prisma.holding.update({
          where: { id: existing.id },
          data: { units: qty, currentValue, investedValue, lastUpdated: new Date() }
        })
      } else {
        await prisma.holding.create({
          data: {
            userId,
            name: symbol,
            assetClass: 'STOCK',
            currentValue,
            investedValue,
            units: qty,
            notes: JSON.stringify({ source: 'GROWW', exchange, isin: h.isin })
          }
        })
        holdingsSynced++
      }
    }
  } catch (err: unknown) {
    if (err instanceof AppError && err.statusCode === 401) throw err
    errors.push(`Holdings: ${err instanceof Error ? err.message : String(err)}`)
  }

  // ── Orders ──────────────────────────────────────────────────────────────────
  try {
    const data = await growwGet<GrowwOrdersPayload>(accessToken, '/v1/order/list')
    const completed = (data.orders ?? []).filter(
      (o) => o.order_status === 'COMPLETE' || o.order_status === 'EXECUTED'
    )

    for (const o of completed) {
      const exchange = o.exchange?.toUpperCase() === 'BSE' ? 'BSE' : 'NSE'
      const execPrice = o.average_price ?? o.price
      const pricePaise = Math.round(execPrice * 100)
      const dateStr = o.order_timestamp.slice(0, 10)

      const existing = await prisma.trade.findFirst({
        where: { userId, symbol: o.trading_symbol, date: dateStr, quantity: o.quantity, pricePaise, deletedAt: null }
      })

      if (existing) { tradesSkipped++; continue }

      await prisma.trade.create({
        data: {
          userId,
          symbol: o.trading_symbol,
          exchange,
          segment: 'EQ',
          tradeType: o.transaction_type === 'BUY' ? 'BUY' : 'SELL',
          quantity: o.quantity,
          pricePaise,
          brokeragePaise: 0,
          date: dateStr,
          broker: 'GROWW',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          importedFrom: 'GROWW' as any
        }
      })
      tradesSynced++
    }
  } catch (err: unknown) {
    if (err instanceof AppError && err.statusCode === 401) throw err
    errors.push(`Orders: ${err instanceof Error ? err.message : String(err)}`)
  }

  const errorMsg = errors.length ? errors.join('; ') : null

  await prisma.brokerConnection.update({
    where: { userId_broker: { userId, broker: 'GROWW' } },
    data: {
      lastSyncedAt: new Date(),
      tradesSynced: { increment: tradesSynced },
      duplicatesSkipped: { increment: tradesSkipped },
      errorMessage: errorMsg
    }
  })

  return {
    holdings: { synced: holdingsSynced, skipped: 0 },
    trades: { synced: tradesSynced, skipped: tradesSkipped },
    errors
  }
}
