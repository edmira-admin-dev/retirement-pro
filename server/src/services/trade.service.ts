import { Exchange, Segment, TradeType, TradeSource } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface TradeInput {
  symbol: string
  exchange: Exchange
  segment: Segment
  tradeType: TradeType
  quantity: number
  pricePaise: number
  date: string
  brokeragePaise?: number
  notes?: string | null
  importedFrom?: TradeSource
}

interface BuyLot {
  qty: number
  pricePaise: number
}

function buildFifoState(trades: {
  symbol: string
  exchange: Exchange
  segment: Segment
  tradeType: TradeType
  quantity: number
  pricePaise: number
  date: string
  brokeragePaise: number
}[]) {
  type SymbolKey = string
  const buyQueues = new Map<SymbolKey, BuyLot[]>()
  const realizedPnl = new Map<SymbolKey, number>()
  const brokerage = new Map<SymbolKey, number>()

  const key = (t: { symbol: string; exchange: string; segment: string }) =>
    `${t.symbol}|${t.exchange}|${t.segment}`

  const sorted = [...trades].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )

  for (const trade of sorted) {
    const k = key(trade)
    if (!buyQueues.has(k)) buyQueues.set(k, [])
    if (!realizedPnl.has(k)) realizedPnl.set(k, 0)
    if (!brokerage.has(k)) brokerage.set(k, 0)

    brokerage.set(k, (brokerage.get(k) ?? 0) + trade.brokeragePaise)

    if (trade.tradeType === 'BUY') {
      buyQueues.get(k)!.push({ qty: trade.quantity, pricePaise: trade.pricePaise })
    } else {
      let remaining = trade.quantity
      const queue = buyQueues.get(k)!
      let tradeRealized = 0

      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0]!
        const matched = Math.min(lot.qty, remaining)
        tradeRealized += (trade.pricePaise - lot.pricePaise) * matched
        lot.qty -= matched
        remaining -= matched
        if (lot.qty === 0) queue.shift()
      }

      tradeRealized -= trade.brokeragePaise
      realizedPnl.set(k, (realizedPnl.get(k) ?? 0) + tradeRealized)
    }
  }

  return { buyQueues, realizedPnl, brokerage }
}

export async function list(
  userId: string,
  symbol?: string,
  segment?: Segment,
  from?: string,
  to?: string,
) {
  return prisma.trade.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(symbol ? { symbol: { contains: symbol } } : {}),
      ...(segment ? { segment } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: 'desc' },
    take: 500,
  })
}

export async function createSingle(userId: string, data: TradeInput) {
  return prisma.trade.create({
    data: {
      userId,
      symbol: data.symbol.toUpperCase(),
      exchange: data.exchange,
      segment: data.segment,
      tradeType: data.tradeType,
      quantity: data.quantity,
      pricePaise: data.pricePaise,
      date: data.date,
      brokeragePaise: data.brokeragePaise ?? 0,
      notes: data.notes ?? null,
      importedFrom: data.importedFrom ?? 'MANUAL',
    },
  })
}

export async function createBatch(userId: string, items: TradeInput[]) {
  const rows = items.map((data) => ({
    userId,
    symbol: data.symbol.toUpperCase(),
    exchange: data.exchange,
    segment: data.segment,
    tradeType: data.tradeType,
    quantity: data.quantity,
    pricePaise: data.pricePaise,
    date: data.date,
    brokeragePaise: data.brokeragePaise ?? 0,
    notes: data.notes ?? null,
    importedFrom: data.importedFrom ?? 'MANUAL',
  }))
  await prisma.trade.createMany({ data: rows })
  return { count: rows.length }
}

export async function update(userId: string, id: string, data: Partial<TradeInput>) {
  const trade = await prisma.trade.findFirst({ where: { id, userId, deletedAt: null } })
  if (!trade) throw new AppError(404, 'Trade not found')

  return prisma.trade.update({
    where: { id },
    data: {
      ...(data.symbol !== undefined ? { symbol: data.symbol.toUpperCase() } : {}),
      ...(data.exchange !== undefined ? { exchange: data.exchange } : {}),
      ...(data.segment !== undefined ? { segment: data.segment } : {}),
      ...(data.tradeType !== undefined ? { tradeType: data.tradeType } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.pricePaise !== undefined ? { pricePaise: data.pricePaise } : {}),
      ...(data.date !== undefined ? { date: data.date } : {}),
      ...(data.brokeragePaise !== undefined ? { brokeragePaise: data.brokeragePaise } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  })
}

export async function remove(userId: string, id: string) {
  const trade = await prisma.trade.findFirst({ where: { id, userId, deletedAt: null } })
  if (!trade) throw new AppError(404, 'Trade not found')
  await prisma.trade.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function positions(userId: string) {
  const trades = await prisma.trade.findMany({
    where: { userId, deletedAt: null },
    select: {
      symbol: true,
      exchange: true,
      segment: true,
      tradeType: true,
      quantity: true,
      pricePaise: true,
      date: true,
      brokeragePaise: true,
    },
    orderBy: { date: 'asc' },
  })

  const { buyQueues } = buildFifoState(trades)

  const ltpRecords = await prisma.positionLtp.findMany({ where: { userId } })
  const ltpMap = new Map(ltpRecords.map((r) => [`${r.symbol}`, r.ltpPaise]))

  const result: {
    symbol: string
    exchange: Exchange
    segment: Segment
    netQty: number
    avgBuyPricePaise: number
    ltpPaise: number
    unrealizedPnlPaise: number
  }[] = []

  for (const [key, lots] of buyQueues.entries()) {
    const netQty = lots.reduce((s, l) => s + l.qty, 0)
    if (netQty === 0) continue

    const [symbol, exchange, segment] = key.split('|') as [string, string, string]
    const totalCost = lots.reduce((s, l) => s + l.qty * l.pricePaise, 0)
    const avgBuyPricePaise = Math.round(totalCost / netQty)
    const ltpPaise = ltpMap.get(symbol) ?? 0
    const unrealizedPnlPaise = (ltpPaise - avgBuyPricePaise) * netQty

    result.push({
      symbol,
      exchange: exchange as Exchange,
      segment: segment as Segment,
      netQty,
      avgBuyPricePaise,
      ltpPaise,
      unrealizedPnlPaise,
    })
  }

  return result
}

export async function pnlSummary(userId: string, from?: string, to?: string) {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(from || to
        ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
        : {}),
    },
    select: {
      symbol: true,
      exchange: true,
      segment: true,
      tradeType: true,
      quantity: true,
      pricePaise: true,
      date: true,
      brokeragePaise: true,
    },
    orderBy: { date: 'asc' },
  })

  const { realizedPnl, brokerage } = buildFifoState(trades)

  let totalRealizedPnl = 0
  let totalBrokerage = 0
  for (const v of realizedPnl.values()) totalRealizedPnl += v
  for (const v of brokerage.values()) totalBrokerage += v

  const positionList = await positions(userId)
  const totalUnrealizedPnl = positionList.reduce((s, p) => s + p.unrealizedPnlPaise, 0)

  return { realizedPnlPaise: totalRealizedPnl, unrealizedPnlPaise: totalUnrealizedPnl, totalBrokeragePaise: totalBrokerage }
}

export async function updateLtp(userId: string, symbol: string, ltpPaise: number) {
  return prisma.positionLtp.upsert({
    where: { userId_symbol: { userId, symbol: symbol.toUpperCase() } },
    create: { userId, symbol: symbol.toUpperCase(), ltpPaise },
    update: { ltpPaise },
  })
}
