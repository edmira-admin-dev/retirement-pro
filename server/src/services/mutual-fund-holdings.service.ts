import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface ParsedMutualFundHolding {
  fundName: string
  amcName: string
  category: string
  subCategory: string
  planType: string
  optionType: string
  nav: number
  units: number
  investedValue: number
  currentValue: number
  weightPct: number
  pnl: number
  pnlPct: number
  xirrPct: number
  investedSince: string
  asOfDate: string
  isDuplicate?: boolean
}

export interface MutualFundHoldingsParseResult {
  fileName: string
  asOfDate: string
  holdings: ParsedMutualFundHolding[]
  newCount: number
  duplicateCount: number
}

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
}

// "Mutual Funds Holdings - Thu Aug 06 2026" -> "2026-08-06"
function parseTitleDate (line: string): string {
  const m = line.match(/([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/)
  if (!m) return ''
  const [, mon, d, y] = m
  const month = MONTH_MAP[mon.toUpperCase()]
  if (!month) return ''
  return `${y}-${month}-${d.padStart(2, '0')}`
}

// Handles quoted fields (fund names can contain commas) and "" escaped quotes.
function parseCsvLine (line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function parseTickertapeMfCsv (buffer: Buffer): { holdings: Omit<ParsedMutualFundHolding, 'isDuplicate'>[]; asOfDate: string } {
  const text = buffer.toString('utf-8').replace(/^﻿/, '')
  const lines = text.split('\n').map(l => l.replace(/\r$/, ''))

  let asOfDate = ''
  let headerSeen = false
  const holdings: Omit<ParsedMutualFundHolding, 'isDuplicate'>[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (!asOfDate && /Mutual Funds Holdings/i.test(line)) { asOfDate = parseTitleDate(line); continue }

    const cols = parseCsvLine(line)

    if (!headerSeen) {
      if (cols[0] === 'Fund Name') headerSeen = true
      continue
    }

    const fundName = cols[0]
    if (!fundName || fundName === 'Total') continue

    holdings.push({
      fundName,
      amcName: cols[1] ?? '',
      category: cols[2] ?? '',
      subCategory: cols[3] ?? '',
      planType: cols[4] ?? '',
      optionType: cols[5] ?? '',
      nav: Number(cols[6] ?? 0),
      units: Number(cols[7] ?? 0),
      investedValue: Number(cols[8] ?? 0),
      currentValue: Number(cols[9] ?? 0),
      weightPct: Number(cols[10] ?? 0),
      pnl: Number(cols[11] ?? 0),
      pnlPct: Number(cols[12] ?? 0),
      xirrPct: Number(cols[13] ?? 0),
      investedSince: cols[14] ?? '',
      asOfDate,
    })
  }

  if (!headerSeen) throw new AppError(400, 'Could not find "Fund Name" header row in Tickertape mutual fund holdings CSV')
  if (!asOfDate) throw new AppError(400, 'Could not determine holdings date from CSV title row')

  return { holdings, asOfDate }
}

async function flagDuplicates (userId: string, holdings: Omit<ParsedMutualFundHolding, 'isDuplicate'>[]): Promise<ParsedMutualFundHolding[]> {
  if (!holdings.length) return holdings
  const asOfDate = holdings[0].asOfDate
  const existing = await prisma.mutualFundHolding.findMany({
    where: { userId, asOfDate, fundName: { in: holdings.map(h => h.fundName) } },
    select: { fundName: true },
  })
  const existingNames = new Set(existing.map(r => r.fundName))
  return holdings.map(h => ({ ...h, isDuplicate: existingNames.has(h.fundName) }))
}

export async function parseFile (userId: string, fileName: string, buffer: Buffer): Promise<MutualFundHoldingsParseResult> {
  const { holdings: raw, asOfDate } = parseTickertapeMfCsv(buffer)
  const holdings = await flagDuplicates(userId, raw)
  return {
    fileName,
    asOfDate,
    holdings,
    newCount: holdings.filter(h => !h.isDuplicate).length,
    duplicateCount: holdings.filter(h => h.isDuplicate).length,
  }
}

export async function saveBatch (userId: string, holdings: ParsedMutualFundHolding[]): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  await prisma.$transaction(async (tx) => {
    for (const h of holdings) {
      const data = {
        amcName: h.amcName, category: h.category, subCategory: h.subCategory,
        planType: h.planType, optionType: h.optionType, nav: h.nav, units: h.units,
        investedValue: h.investedValue, currentValue: h.currentValue, weightPct: h.weightPct,
        pnl: h.pnl, pnlPct: h.pnlPct, xirrPct: h.xirrPct, investedSince: h.investedSince,
      }
      const existing = await tx.mutualFundHolding.findUnique({
        where: { userId_fundName_asOfDate: { userId, fundName: h.fundName, asOfDate: h.asOfDate } },
        select: { id: true },
      })
      if (existing) {
        await tx.mutualFundHolding.update({ where: { id: existing.id }, data })
        updated++
      } else {
        await tx.mutualFundHolding.create({ data: { userId, fundName: h.fundName, asOfDate: h.asOfDate, ...data } })
        created++
      }
    }
  })

  return { created, updated }
}

export async function getDates (userId: string): Promise<string[]> {
  const rows = await prisma.mutualFundHolding.findMany({
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
  return prisma.mutualFundHolding.findMany({
    where: { userId, asOfDate: targetDate },
    orderBy: [{ currentValue: 'desc' }],
  })
}
