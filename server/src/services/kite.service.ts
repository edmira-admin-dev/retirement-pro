import { KiteConnect, type Connect } from 'kiteconnect'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

const API_KEY = process.env.KITE_API_KEY ?? ''
const API_SECRET = process.env.KITE_API_SECRET ?? ''

interface KiteHolding {
  tradingsymbol: string
  exchange: string
  quantity: number
  average_price: number
  last_price: number
}

interface KiteOrder {
  tradingsymbol: string
  exchange: string
  transaction_type: string
  quantity: number
  average_price: number
  status: string
  order_timestamp: Date | string
  order_id: string
}

function makeKite (accessToken?: string): Connect {
  const kc = new KiteConnect({ api_key: API_KEY })
  if (accessToken) kc.setAccessToken(accessToken)
  return kc
}

function parseToken (credJson: string | null | undefined): string | null {
  if (!credJson) return null
  try {
    return (
      (JSON.parse(credJson) as { accessToken?: string }).accessToken ?? null
    )
  } catch {
    return null
  }
}

function toDateStr (timestamp: Date | string): string {
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return d.toISOString().slice(0, 10)
}

export function getLoginUrl (): string {
  if (!API_KEY) throw new AppError(500, 'KITE_API_KEY not configured')
  return makeKite().getLoginURL()
}

export async function callback (
  userId: string,
  requestToken: string
): Promise<void> {
  if (!API_KEY || !API_SECRET)
    throw new AppError(500, 'Kite API credentials not configured')
  const kc = makeKite()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: any = await kc.generateSession(requestToken, API_SECRET)
  const accessToken: string = session.access_token

  await prisma.brokerConnection.upsert({
    where: { userId_broker: { userId, broker: 'KITE' } },
    create: {
      userId,
      broker: 'KITE',
      connectionType: 'API',
      status: 'CONNECTED',
      credentialsJson: JSON.stringify({ accessToken })
    },
    update: {
      status: 'CONNECTED',
      credentialsJson: JSON.stringify({ accessToken }),
      errorMessage: null,
      deletedAt: null
    }
  })
}

export async function getStatus (userId: string) {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'KITE' } },
    select: {
      status: true,
      lastSyncedAt: true,
      tradesSynced: true,
      duplicatesSkipped: true,
      errorMessage: true,
      deletedAt: true
    }
  })

  if (!row || row.deletedAt) {
    return {
      connected: false,
      lastSyncedAt: null,
      syncSummary: null,
      errorMessage: null
    }
  }

  return {
    connected: row.status === 'CONNECTED',
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    syncSummary:
      row.status === 'CONNECTED'
        ? {
            holdingsSynced: 0,
            tradesSynced: row.tradesSynced,
            duplicatesSkipped: row.duplicatesSkipped
          }
        : null,
    errorMessage: row.errorMessage ?? null
  }
}

export async function getHoldings (userId: string): Promise<KiteHolding[]> {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'KITE' } }
  })
  if (!row || row.status !== 'CONNECTED')
    throw new AppError(400, 'Kite not connected')
  const accessToken = parseToken(row.credentialsJson)
  if (!accessToken)
    throw new AppError(400, 'Kite session expired — reconnect to continue')
  const kc = makeKite(accessToken)
  return (await kc.getHoldings()) as KiteHolding[]
}

export async function sync (userId: string) {
  const row = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker: 'KITE' } }
  })

  if (!row || row.status !== 'CONNECTED')
    throw new AppError(400, 'Kite not connected')

  const accessToken = parseToken(row.credentialsJson)
  if (!accessToken)
    throw new AppError(400, 'Kite session expired — reconnect to continue')

  const kc = makeKite(accessToken)
  const errors: string[] = []
  let holdingsSynced = 0
  let tradesSynced = 0
  let tradesSkipped = 0

  // --- Sync holdings ---
  try {
    const rawHoldings = (await kc.getHoldings()) as KiteHolding[]
    for (const h of rawHoldings) {
      const currentValue = BigInt(Math.round(h.last_price * h.quantity * 100))
      const investedValue = BigInt(
        Math.round(h.average_price * h.quantity * 100)
      )

      const existing = await prisma.holding.findFirst({
        where: {
          userId,
          name: h.tradingsymbol,
          assetClass: 'STOCK',
          deletedAt: null,
          notes: { contains: '"source":"KITE"' }
        }
      })

      if (existing) {
        await prisma.holding.update({
          where: { id: existing.id },
          data: { currentValue, investedValue, units: h.quantity, lastUpdated: new Date() }
        })
      } else {
        await prisma.holding.create({
          data: {
            userId,
            name: h.tradingsymbol,
            assetClass: 'STOCK',
            currentValue,
            investedValue,
            units: h.quantity,
            notes: JSON.stringify({ source: 'KITE', exchange: h.exchange })
          }
        })
        holdingsSynced++
      }
    }
  } catch (err: unknown) {
    errors.push(`Holdings: ${err instanceof Error ? err.message : String(err)}`)
  }

  // --- Sync completed orders ---
  try {
    const rawOrders = (await kc.getOrders()) as KiteOrder[]
    for (const o of rawOrders) {
      if (o.status !== 'COMPLETE') continue
      if (o.exchange !== 'NSE' && o.exchange !== 'BSE') continue

      const dateStr = toDateStr(o.order_timestamp)
      const pricePaise = Math.round(o.average_price * 100)

      const existing = await prisma.trade.findFirst({
        where: {
          userId,
          symbol: o.tradingsymbol,
          date: dateStr,
          quantity: o.quantity,
          pricePaise,
          deletedAt: null
        }
      })

      if (existing) {
        tradesSkipped++
        continue
      }

      await prisma.trade.create({
        data: {
          userId,
          symbol: o.tradingsymbol,
          exchange: o.exchange as 'NSE' | 'BSE',
          segment: 'EQ',
          tradeType: o.transaction_type === 'BUY' ? 'BUY' : 'SELL',
          quantity: o.quantity,
          pricePaise,
          brokeragePaise: 0,
          date: dateStr,
          broker: 'KITE',
          importedFrom: 'KITE'
        }
      })
      tradesSynced++
    }
  } catch (err: unknown) {
    errors.push(`Trades: ${err instanceof Error ? err.message : String(err)}`)
  }

  const errorMsg = errors.length ? errors.join('; ') : null

  await prisma.brokerConnection.update({
    where: { userId_broker: { userId, broker: 'KITE' } },
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
