import { prisma } from '../config/prisma'
import type { Prisma } from '@prisma/client'
import type { ParsedRealizedPnl, ParsedDividend, ParsedCharge, ParsedHolding } from './tradebook.service'

export interface TaxPnlSavePayload {
  broker: string
  realizedPnl: ParsedRealizedPnl[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
}

export interface TableResult { created: number; updated: number; skipped: number }

export interface TaxPnlSaveResult {
  realizedPnl: TableResult
  dividends: TableResult
  charges: TableResult
  holdings: TableResult
}

function emptyResult(): TableResult { return { created: 0, updated: 0, skipped: 0 } }

export async function saveTaxPnl(userId: string, payload: TaxPnlSavePayload): Promise<TaxPnlSaveResult> {
  const { broker, realizedPnl, dividends, charges, holdings } = payload

  const results = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const pnl = emptyResult()
    for (const r of realizedPnl) {
      const key = {
        userId_broker_symbol_isin_entryDate_exitDate_holdingType_quantity: {
          userId, broker, symbol: r.symbol, isin: r.isin,
          entryDate: r.entryDate, exitDate: r.exitDate,
          holdingType: r.holdingType, quantity: r.quantity,
        },
      }
      const existing = await tx.realizedPnlRecord.findUnique({ where: key, select: { id: true } })
      if (existing) {
        await tx.realizedPnlRecord.update({
          where: { id: existing.id },
          data: {
            buyValue: r.buyValue, sellValue: r.sellValue, profit: r.profit,
            taxableProfit: r.taxableProfit, tradeCharges: r.charges ?? 0,
            periodFrom: r.periodFrom, periodTo: r.periodTo,
          },
        })
        pnl.updated++
      } else {
        await tx.realizedPnlRecord.create({
          data: {
            userId, broker, symbol: r.symbol, isin: r.isin,
            entryDate: r.entryDate, exitDate: r.exitDate,
            quantity: r.quantity, buyValue: r.buyValue, sellValue: r.sellValue,
            profit: r.profit, holdingType: r.holdingType, taxableProfit: r.taxableProfit,
            tradeCharges: r.charges ?? 0,
            periodFrom: r.periodFrom, periodTo: r.periodTo,
          },
        })
        pnl.created++
      }
    }

    const div = emptyResult()
    for (const d of dividends) {
      const key = {
        userId_broker_isin_exDate: {
          userId, broker, isin: d.isin, exDate: d.exDate,
        },
      }
      // Delete any stale records for this ISIN+broker with non-ISO date format (DD-MM-YYYY legacy)
      await tx.$executeRaw`DELETE FROM \`DividendRecord\` WHERE userId = ${userId} AND broker = ${broker} AND isin = ${d.isin} AND exDate NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'`
      const existing = await tx.dividendRecord.findUnique({ where: key, select: { id: true } })
      if (existing) {
        await tx.dividendRecord.update({
          where: { id: existing.id },
          data: { quantity: d.quantity, dividendPerShare: d.dividendPerShare, netAmount: d.netAmount },
        })
        div.updated++
      } else {
        await tx.dividendRecord.create({
          data: {
            userId, broker, symbol: d.symbol, isin: d.isin, exDate: d.exDate,
            quantity: d.quantity, dividendPerShare: d.dividendPerShare, netAmount: d.netAmount,
          },
        })
        div.created++
      }
    }

    const chg = emptyResult()
    for (const c of charges) {
      const key = {
        userId_broker_periodFrom_periodTo_accountHead: {
          userId, broker, periodFrom: c.periodFrom, periodTo: c.periodTo, accountHead: c.accountHead,
        },
      }
      const existing = await tx.agtsCharge.findUnique({ where: key, select: { id: true } })
      if (existing) {
        await tx.agtsCharge.update({ where: { id: existing.id }, data: { amount: c.amount } })
        chg.updated++
      } else {
        await tx.agtsCharge.create({
          data: {
            userId, broker, periodFrom: c.periodFrom, periodTo: c.periodTo,
            accountHead: c.accountHead, amount: c.amount,
          },
        })
        chg.created++
      }
    }

    const hld = emptyResult()
    const today = new Date().toISOString().slice(0, 10)
    for (const h of holdings) {
      const key = {
        userId_broker_isin_asOfDate: {
          userId, broker, isin: h.isin, asOfDate: h.asOfDate || today,
        },
      }
      const existing = await tx.brokerHolding.findUnique({ where: key, select: { id: true } })
      if (existing) {
        await tx.brokerHolding.update({
          where: { id: existing.id },
          data: {
            symbol: h.symbol, sector: h.sector || '',
            quantityAvailable: h.quantityAvailable,
            quantityLongTerm: h.quantityLongTerm ?? 0,
            avgPrice: h.avgPrice, currentPrice: h.currentPrice,
            unrealizedPnl: h.unrealizedPnl, unrealizedPnlPct: h.unrealizedPnlPct,
          },
        })
        hld.updated++
      } else {
        await tx.brokerHolding.create({
          data: {
            userId, broker, symbol: h.symbol, isin: h.isin,
            sector: h.sector || '',
            quantityAvailable: h.quantityAvailable,
            quantityLongTerm: h.quantityLongTerm ?? 0,
            avgPrice: h.avgPrice, currentPrice: h.currentPrice,
            unrealizedPnl: h.unrealizedPnl, unrealizedPnlPct: h.unrealizedPnlPct,
            asOfDate: h.asOfDate || today,
          },
        })
        hld.created++
      }
    }

    return { pnl, div, chg, hld }
  })

  return {
    realizedPnl: results.pnl,
    dividends: results.div,
    charges: results.chg,
    holdings: results.hld,
  }
}

export async function getTaxPnlData(userId: string, broker: string) {
  // Fetch all records for user; filter by broker in memory to avoid Prisma null-in-OR type issues
  const [realizedPnlAll, dividendsAll, chargesAll, holdingsAll] = await Promise.all([
    prisma.realizedPnlRecord.findMany({ where: { userId }, orderBy: { exitDate: 'desc' } }),
    prisma.dividendRecord.findMany({ where: { userId }, orderBy: { exDate: 'desc' } }),
    prisma.agtsCharge.findMany({ where: { userId }, orderBy: { periodFrom: 'asc' } }),
    prisma.brokerHolding.findMany({ where: { userId }, orderBy: { symbol: 'asc' } }),
  ])

  const matchesBroker = (b: string | null) => broker === 'ALL' || b === broker || b === null

  const realizedPnl = realizedPnlAll.filter(r => matchesBroker(r.broker))
  const dividendsRaw = dividendsAll.filter(d => matchesBroker(d.broker))
  const chargesRaw   = chargesAll.filter(c => matchesBroker(c.broker))
  const holdingsAll2 = holdingsAll.filter(h => matchesBroker(h.broker))

  // Deduplicate dividends by (isin, exDate) — prefer broker-specific over null-broker
  const divMap = new Map<string, typeof dividendsRaw[0]>()
  for (const d of dividendsRaw) {
    const key = `${d.isin}|${d.exDate}`
    const existing = divMap.get(key)
    if (!existing || (existing.broker === null && d.broker !== null)) divMap.set(key, d)
  }
  const dividends = Array.from(divMap.values()).sort((a, b) => b.exDate.localeCompare(a.exDate))

  // Deduplicate charges by (periodFrom, periodTo, accountHead)
  const chgMap = new Map<string, typeof chargesRaw[0]>()
  for (const c of chargesRaw) {
    const key = `${c.periodFrom}|${c.periodTo}|${c.accountHead}`
    const existing = chgMap.get(key)
    if (!existing || (existing.broker === null && c.broker !== null)) chgMap.set(key, c)
  }
  const charges = Array.from(chgMap.values()).sort((a, b) => a.periodFrom.localeCompare(b.periodFrom))

  return { realizedPnl, dividends, charges, holdings: holdingsAll2 }
}

export async function deleteBrokerData(userId: string, broker: string) {
  // Delete all Tax P&L records for this broker so the user can re-upload cleanly.
  // broker='ALL' clears every broker (including legacy null-broker tradebook rows).
  const brokerFilter = broker === 'ALL' ? {} : { broker }
  const [realizedPnl, dividends, charges, holdings] = await prisma.$transaction([
    prisma.realizedPnlRecord.deleteMany({ where: { userId, ...brokerFilter } }),
    prisma.dividendRecord.deleteMany({ where: { userId, ...brokerFilter } }),
    prisma.agtsCharge.deleteMany({ where: { userId, ...brokerFilter } }),
    prisma.brokerHolding.deleteMany({ where: { userId, ...brokerFilter } }),
  ])
  return {
    realizedPnl: realizedPnl.count,
    dividends: dividends.count,
    charges: charges.count,
    holdings: holdings.count,
  }
}

export async function getAllHoldings(userId: string, broker?: string) {
  const where = broker ? { userId, broker } : { userId }
  const rows = await prisma.brokerHolding.findMany({
    where,
    orderBy: [{ asOfDate: 'desc' }, { symbol: 'asc' }],
  })
  // Latest snapshot per symbol
  const latest = new Map<string, typeof rows[0]>()
  for (const r of rows) {
    const existing = latest.get(r.symbol)
    if (!existing || r.asOfDate > existing.asOfDate) latest.set(r.symbol, r)
  }
  return Array.from(latest.values())
}

export interface SymbolSummary {
  symbol: string
  isin: string
  stcg: number
  ltcg: number
  otherGain: number   // INTRADAY + NON_EQ_*
  totalDividend: number
  lastExitDate: string
  trades: Array<{
    entryDate: string; exitDate: string; quantity: number; buyValue: number
    sellValue: number; profit: number; holdingType: string; tradeCharges: number
  }>
}

export async function getChargesSummary(userId: string, broker?: string) {
  const where = broker ? { userId, broker } : { userId }
  const [tradeChargesAgg, agtsRows] = await Promise.all([
    prisma.realizedPnlRecord.aggregate({ where, _sum: { tradeCharges: true } }),
    prisma.agtsCharge.findMany({ where, select: { amount: true } }),
  ])
  const tradeCharges = tradeChargesAgg._sum.tradeCharges ?? 0
  const otherCharges = agtsRows.reduce((s, r) => s + r.amount, 0)
  return { tradeCharges, otherCharges }
}

export async function getSymbolSummary(userId: string, broker?: string): Promise<SymbolSummary[]> {
  const where = broker ? { userId, broker } : { userId }
  const [pnlRows, divRows] = await Promise.all([
    prisma.realizedPnlRecord.findMany({
      where,
      select: { symbol: true, isin: true, entryDate: true, exitDate: true, quantity: true,
                buyValue: true, sellValue: true, profit: true, holdingType: true, tradeCharges: true },
      orderBy: { exitDate: 'desc' },
    }),
    prisma.dividendRecord.findMany({
      where,
      select: { symbol: true, netAmount: true },
    }),
  ])

  const divMap = new Map<string, number>()
  for (const d of divRows) {
    const sym = d.symbol.replace(/[#\d]+$/, '').trim()
    divMap.set(sym, (divMap.get(sym) ?? 0) + d.netAmount)
  }

  // Normalize symbol: strip trailing digits and # (Zerodha uses HCLTECH# for pre-bonus, BAJFINANCE6 for rights)
  const normalizeSymbol = (sym: string) => sym.replace(/[#\d]+$/, '').trim()

  const map = new Map<string, SymbolSummary>()
  for (const r of pnlRows) {
    const sym = normalizeSymbol(r.symbol)
    let entry = map.get(sym)
    if (!entry) {
      entry = { symbol: sym, isin: r.isin, stcg: 0, ltcg: 0, otherGain: 0,
                totalDividend: divMap.get(sym) ?? 0, lastExitDate: r.exitDate, trades: [] }
      map.set(sym, entry)
    }
    const ht = r.holdingType.toUpperCase()
    if (ht === 'LTCG' || ht === 'NON_EQ_LTCG') entry.ltcg += r.profit
    else if (ht === 'STCG' || ht === 'NON_EQ_STCG') entry.stcg += r.profit
    else entry.otherGain += r.profit
    if (r.exitDate > entry.lastExitDate) entry.lastExitDate = r.exitDate
    entry.trades.push({ entryDate: r.entryDate, exitDate: r.exitDate, quantity: r.quantity,
                        buyValue: r.buyValue, sellValue: r.sellValue, profit: r.profit,
                        holdingType: r.holdingType, tradeCharges: r.tradeCharges })
  }

  // add dividend-only symbols (no realized P&L) — divMap keys are already normalized
  for (const [sym, amt] of divMap) {
    if (!map.has(sym)) {
      map.set(sym, { symbol: sym, isin: '', stcg: 0, ltcg: 0, otherGain: 0,
                     totalDividend: amt, lastExitDate: '', trades: [] })
    }
  }

  return Array.from(map.values())
}

export async function getExitedSymbols(userId: string) {
  const rows = await prisma.realizedPnlRecord.findMany({
    where: { userId },
    select: { symbol: true, isin: true, profit: true, sellValue: true, exitDate: true },
    orderBy: { exitDate: 'desc' },
  })
  const map = new Map<string, { symbol: string; isin: string; totalProfit: number; totalSellValue: number; lastExitDate: string }>()
  for (const r of rows) {
    const existing = map.get(r.symbol)
    if (existing) {
      existing.totalProfit += r.profit
      existing.totalSellValue += r.sellValue
      if (r.exitDate > existing.lastExitDate) existing.lastExitDate = r.exitDate
    } else {
      map.set(r.symbol, { symbol: r.symbol, isin: r.isin, totalProfit: r.profit, totalSellValue: r.sellValue, lastExitDate: r.exitDate })
    }
  }
  return Array.from(map.values())
}

export async function getBrokers(userId: string): Promise<string[]> {
  const rows = await prisma.realizedPnlRecord.findMany({
    where: { userId, broker: { not: null } },
    select: { broker: true },
    distinct: ['broker'],
  })
  return rows.map((r: { broker: string | null }) => r.broker).filter(Boolean) as string[]
}
