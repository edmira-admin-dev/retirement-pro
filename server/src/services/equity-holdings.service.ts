import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { lookupSector } from './sector-master.service'

export interface ParsedEquityHolding {
  symbol: string
  companyName: string
  sector: string
  industry: string
  subSector: string
  quantity: number
  avgCost: number
  ltp: number
  investedValue: number
  currentValue: number
  pnl: number
  pnlPct: number
  portfolioWeightPct: number
  dayChange: number
  dayChangePct: number
  asOfDate: string
  isDuplicate?: boolean
}

export interface EquityHoldingsParseResult {
  fileName: string
  asOfDate: string
  holdings: ParsedEquityHolding[]
  newCount: number
  duplicateCount: number
}

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
}

// "26-Jul-26 IST" -> "2026-07-26"
function parseDMonYY (s: string): string {
  const m = s.match(/(\d{1,2})-([A-Za-z]{3})-(\d{2})/)
  if (!m) return ''
  const [, d, mon, yy] = m
  const month = MONTH_MAP[mon.toUpperCase()]
  if (!month) return ''
  const year = Number(yy) >= 70 ? `19${yy}` : `20${yy}`
  return `${year}-${month}-${d.padStart(2, '0')}`
}

function parseTickertapeCsv (buffer: Buffer): { holdings: Omit<ParsedEquityHolding, 'isDuplicate'>[]; asOfDate: string } {
  const text = buffer.toString('utf-8').replace(/^﻿/, '')
  const lines = text.split('\n').map(l => l.replace(/\r$/, ''))

  let asOfDate = ''
  let headerSeen = false
  let inStocksSection = false
  const holdings: Omit<ParsedEquityHolding, 'isDuplicate'>[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!asOfDate && line.includes('Holdings -')) { asOfDate = parseDMonYY(line); continue }
    if (line.startsWith('Security,')) { headerSeen = true; continue }
    if (!headerSeen) continue

    if (line === 'Stocks/ETFs') { inStocksSection = true; continue }
    if (!inStocksSection) continue

    // Blank lines occur both before the first data row and after the last one —
    // only treat a blank as "end of section" once we've collected a row.
    if (!line) { if (holdings.length > 0) break; else continue }

    const cols = line.split(',').map(c => c.trim())
    const symbol = cols[0]
    if (!symbol) break

    // Smallcase basket products (e.g. NIFTYCASE, MID150CASE, TOP100CASE) don't
    // exist in the equity instrument master since they aren't individual
    // stocks — tag those as ETF. Anything else the master doesn't recognize is
    // left "Uncategorized"; the user can correct sector/industry for any row
    // in the upload preview before saving.
    const isBasket = /CASE$/i.test(symbol)
    const looked = lookupSector(symbol)
    const { companyName, sector, industry, subSector } = isBasket && looked.sector === 'Uncategorized'
      ? { companyName: looked.companyName, sector: 'ETF', industry: 'ETF', subSector: 'ETF' }
      : looked

    holdings.push({
      symbol,
      companyName,
      sector,
      industry,
      subSector,
      quantity: Number(cols[2] ?? 0),
      avgCost: Number(cols[3] ?? 0),
      ltp: Number(cols[5] ?? 0),
      investedValue: Number(cols[6] ?? 0),
      currentValue: Number(cols[7] ?? 0),
      pnl: Number(cols[8] ?? 0),
      pnlPct: Number(cols[9] ?? 0),
      portfolioWeightPct: Number(cols[4] ?? 0),
      dayChange: Number(cols[10] ?? 0),
      dayChangePct: Number(cols[11] ?? 0),
      asOfDate,
    })
  }

  if (!headerSeen) throw new AppError(400, 'Could not find "Security" header row in Tickertape holdings CSV')
  if (!asOfDate) throw new AppError(400, 'Could not determine holdings date from CSV title row')

  return { holdings, asOfDate }
}

async function flagDuplicates (userId: string, holdings: Omit<ParsedEquityHolding, 'isDuplicate'>[]): Promise<ParsedEquityHolding[]> {
  if (!holdings.length) return holdings
  const asOfDate = holdings[0].asOfDate
  const existing = await prisma.equityHolding.findMany({
    where: { userId, asOfDate, symbol: { in: holdings.map(h => h.symbol) } },
    select: { symbol: true },
  })
  const existingSymbols = new Set(existing.map(r => r.symbol))
  return holdings.map(h => ({ ...h, isDuplicate: existingSymbols.has(h.symbol) }))
}

export async function parseFile (userId: string, fileName: string, buffer: Buffer): Promise<EquityHoldingsParseResult> {
  const { holdings: raw, asOfDate } = parseTickertapeCsv(buffer)
  const holdings = await flagDuplicates(userId, raw)
  return {
    fileName,
    asOfDate,
    holdings,
    newCount: holdings.filter(h => !h.isDuplicate).length,
    duplicateCount: holdings.filter(h => h.isDuplicate).length,
  }
}

export async function saveBatch (userId: string, holdings: ParsedEquityHolding[]): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  await prisma.$transaction(async (tx) => {
    for (const h of holdings) {
      const data = {
        companyName: h.companyName, sector: h.sector, industry: h.industry,
        quantity: h.quantity, avgCost: h.avgCost, ltp: h.ltp,
        investedValue: h.investedValue, currentValue: h.currentValue,
        pnl: h.pnl, pnlPct: h.pnlPct, portfolioWeightPct: h.portfolioWeightPct,
        dayChange: h.dayChange, dayChangePct: h.dayChangePct,
      }
      const existing = await tx.equityHolding.findUnique({
        where: { userId_symbol_asOfDate: { userId, symbol: h.symbol, asOfDate: h.asOfDate } },
        select: { id: true },
      })
      if (existing) {
        await tx.equityHolding.update({ where: { id: existing.id }, data })
        updated++
      } else {
        await tx.equityHolding.create({ data: { userId, symbol: h.symbol, asOfDate: h.asOfDate, ...data } })
        created++
      }
    }
  })

  return { created, updated }
}

export async function getDates (userId: string): Promise<string[]> {
  const rows = await prisma.equityHolding.findMany({
    where: { userId },
    distinct: ['asOfDate'],
    select: { asOfDate: true },
    orderBy: { asOfDate: 'desc' },
  })
  return rows.map(r => r.asOfDate)
}

export async function getHoldings (userId: string, asOfDate?: string) {
  const targetDate = asOfDate ?? (await getDates(userId))[0]
  if (!targetDate) return []
  const rows = await prisma.equityHolding.findMany({
    where: { userId, asOfDate: targetDate },
    orderBy: [{ sector: 'asc' }, { currentValue: 'desc' }],
  })

  // Sector/industry/sub-sector are re-derived from the current master file on
  // every read rather than trusted from the stored snapshot, so
  // re-classifications in sector-master.csv apply retroactively to
  // already-saved holdings.
  return rows.map(h => {
    const isBasket = /CASE$/i.test(h.symbol)
    const looked = lookupSector(h.symbol)
    const { sector, industry, subSector } = isBasket && looked.sector === 'Uncategorized'
      ? { sector: 'ETF', industry: 'ETF', subSector: 'ETF' }
      : looked
    return { ...h, sector, industry, subSector }
  })
}
