import * as XLSX from 'xlsx'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface FactorReasoning {
  moat: string
  financial: string
  growth: string
  valuation: string
  mgmt: string
  earnings: string
  macro: string
  risk: string
  dividend: string
  liquidity: string
}

export interface ParsedScorecardEntry {
  rank: number
  ticker: string
  sector: string
  cmp: number
  f1: number; f2: number; f3: number; f4: number; f5: number
  f6: number; f7: number; f8: number; f9: number; f10: number
  score: number
  recommendation: string
  reasoning: FactorReasoning
}

export interface ScorecardUploadSummary {
  id: string
  universe: string
  runDate: string
  fileName: string
  createdAt: string
  entryCount: number
}

export const REASONING_KEYS: (keyof FactorReasoning)[] = [
  'moat', 'financial', 'growth', 'valuation', 'mgmt', 'earnings', 'macro', 'risk', 'dividend', 'liquidity',
]

export function recommendationForScore(score: number): string {
  if (score >= 80) return 'OVERWEIGHT — High'
  if (score >= 65) return 'OVERWEIGHT'
  if (score >= 50) return 'MARKET WEIGHT'
  if (score >= 35) return 'UNDERWEIGHT'
  return 'AVOID'
}

function detectUniverse(title: string, fileName: string): string {
  const src = `${title} ${fileName}`.toLowerCase()
  if (src.includes('midcap')) return 'NIFTY_MIDCAP150'
  return 'NIFTY100'
}

function parseWorkbook(buffer: Buffer, fileName: string): { universe: string; entries: ParsedScorecardEntry[] } {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const scoreSheet = wb.Sheets['Factor Scorecard']
  const reasonSheet = wb.Sheets['Reasoning']
  if (!scoreSheet) throw new AppError(400, 'Missing "Factor Scorecard" sheet')

  const scoreRows: unknown[][] = XLSX.utils.sheet_to_json(scoreSheet, { header: 1, defval: null })
  const title = String(scoreRows[0]?.[0] ?? '')
  const universe = detectUniverse(title, fileName)

  const reasonByTicker = new Map<string, FactorReasoning>()
  if (reasonSheet) {
    const reasonRows: unknown[][] = XLSX.utils.sheet_to_json(reasonSheet, { header: 1, defval: null })
    for (const row of reasonRows.slice(2)) {
      const ticker = row[0]
      if (typeof ticker !== 'string' || !ticker.trim()) continue
      const entry = {} as FactorReasoning
      REASONING_KEYS.forEach((key, i) => { entry[key] = String(row[i + 1] ?? '') })
      reasonByTicker.set(ticker.trim(), entry)
    }
  }

  const entries: ParsedScorecardEntry[] = []
  for (const row of scoreRows.slice(2)) {
    const ticker = row[1]
    if (typeof ticker !== 'string' || !ticker.trim()) continue
    const tickerTrim = ticker.trim()
    entries.push({
      rank: Number(row[0]) || entries.length + 1,
      ticker: tickerTrim,
      sector: String(row[2] ?? ''),
      cmp: Number(row[3]) || 0,
      f1: Number(row[4]) || 0, f2: Number(row[5]) || 0, f3: Number(row[6]) || 0, f4: Number(row[7]) || 0,
      f5: Number(row[8]) || 0, f6: Number(row[9]) || 0, f7: Number(row[10]) || 0, f8: Number(row[11]) || 0,
      f9: Number(row[12]) || 0, f10: Number(row[13]) || 0,
      score: Number(row[14]) || 0,
      recommendation: String(row[15] ?? ''),
      reasoning: reasonByTicker.get(tickerTrim) ?? REASONING_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {} as FactorReasoning),
    })
  }

  if (!entries.length) throw new AppError(400, 'No stock rows found in "Factor Scorecard" sheet')
  return { universe, entries }
}

export async function uploadScorecard(userId: string, fileName: string, buffer: Buffer, runDate: string): Promise<ScorecardUploadSummary> {
  const { universe, entries } = parseWorkbook(buffer, fileName)

  const upload = await prisma.$transaction(async (tx) => {
    await tx.factorScorecardUpload.deleteMany({ where: { userId, universe, runDate } })
    const created = await tx.factorScorecardUpload.create({
      data: { userId, fileName, universe, runDate },
    })
    await tx.factorScorecardEntry.createMany({
      data: entries.map((e) => ({
        userId,
        uploadId: created.id,
        universe,
        runDate,
        rank: e.rank,
        ticker: e.ticker,
        sector: e.sector,
        cmp: e.cmp,
        f1: e.f1, f2: e.f2, f3: e.f3, f4: e.f4, f5: e.f5,
        f6: e.f6, f7: e.f7, f8: e.f8, f9: e.f9, f10: e.f10,
        score: e.score,
        recommendation: e.recommendation,
        reasoning: { ...e.reasoning },
      })),
    })
    return created
  })

  return {
    id: upload.id,
    universe: upload.universe,
    runDate: upload.runDate,
    fileName: upload.fileName,
    createdAt: upload.createdAt.toISOString(),
    entryCount: entries.length,
  }
}

export async function getScorecardData(userId: string) {
  const [uploads, entries] = await Promise.all([
    prisma.factorScorecardUpload.findMany({ where: { userId }, orderBy: { runDate: 'desc' } }),
    prisma.factorScorecardEntry.findMany({ where: { userId }, orderBy: { score: 'desc' }, include: { modelScores: true } }),
  ])
  return {
    uploads: uploads.map((u) => ({
      id: u.id, universe: u.universe, runDate: u.runDate, fileName: u.fileName, source: u.source, createdAt: u.createdAt.toISOString(),
    })),
    entries,
  }
}

export async function deleteUpload(userId: string, uploadId: string) {
  const upload = await prisma.factorScorecardUpload.findFirst({ where: { id: uploadId, userId } })
  if (!upload) throw new AppError(404, 'Upload not found')
  await prisma.factorScorecardUpload.delete({ where: { id: uploadId } })
}
