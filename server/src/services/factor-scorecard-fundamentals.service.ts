import * as XLSX from 'xlsx'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import type { FundamentalInput } from './ai-providers'

export interface FundamentalsUploadSummary {
  id: string
  universe: string
  runDate: string
  fileName: string
  rowCount: number
  createdAt: string
}

function detectUniverse(fileName: string): string {
  return fileName.toLowerCase().includes('midcap') ? 'NIFTY_MIDCAP150' : 'NIFTY100'
}

function normalizeHeader(h: unknown): string {
  return String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

const HEADER_MAP: Record<string, keyof FundamentalInput> = {
  ticker: 'ticker',
  symbol: 'ticker',
  sector: 'sector',
  cmp: 'cmp',
  price: 'cmp',
  pe: 'pe',
  peratio: 'pe',
  pb: 'pb',
  pbratio: 'pb',
  roe: 'roe',
  roce: 'roce',
  debttoequity: 'debtToEquity',
  de: 'debtToEquity',
  revenuecagr3yr: 'revenueCagr3yr',
  salescagr3yr: 'revenueCagr3yr',
  profitcagr3yr: 'profitCagr3yr',
  dividendyield: 'dividendYieldPct',
  dividendyieldpct: 'dividendYieldPct',
  payout: 'payoutPct',
  payoutpct: 'payoutPct',
  promoterholding: 'promoterHoldingPct',
  promoterholdingpct: 'promoterHoldingPct',
  fiidiiholding: 'fiiDiiHoldingPct',
  fiidiiholdingpct: 'fiiDiiHoldingPct',
  beta: 'beta',
  notes: 'notes',
}

function parseRows(buffer: Buffer): FundamentalInput[] {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })
  if (!rows.length) throw new AppError(400, 'File is empty')

  const headerRow = rows[0].map(normalizeHeader)
  const colIndex: Partial<Record<keyof FundamentalInput, number>> = {}
  headerRow.forEach((h, i) => {
    const key = HEADER_MAP[h]
    if (key && colIndex[key] === undefined) colIndex[key] = i
  })
  if (colIndex.ticker === undefined) throw new AppError(400, 'Missing "Ticker" column')

  const num = (row: unknown[], key: keyof FundamentalInput): number | null => {
    const i = colIndex[key]
    if (i === undefined) return null
    const v = row[i]
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  }

  const out: FundamentalInput[] = []
  for (const row of rows.slice(1)) {
    const tickerCell = row[colIndex.ticker!]
    if (typeof tickerCell !== 'string' && typeof tickerCell !== 'number') continue
    const ticker = String(tickerCell).trim()
    if (!ticker) continue
    out.push({
      ticker,
      sector: colIndex.sector !== undefined ? String(row[colIndex.sector] ?? '') : '',
      cmp: num(row, 'cmp') ?? 0,
      pe: num(row, 'pe'),
      pb: num(row, 'pb'),
      roe: num(row, 'roe'),
      roce: num(row, 'roce'),
      debtToEquity: num(row, 'debtToEquity'),
      revenueCagr3yr: num(row, 'revenueCagr3yr'),
      profitCagr3yr: num(row, 'profitCagr3yr'),
      dividendYieldPct: num(row, 'dividendYieldPct'),
      payoutPct: num(row, 'payoutPct'),
      promoterHoldingPct: num(row, 'promoterHoldingPct'),
      fiiDiiHoldingPct: num(row, 'fiiDiiHoldingPct'),
      beta: num(row, 'beta'),
      notes: colIndex.notes !== undefined ? String(row[colIndex.notes] ?? '') : null,
    })
  }

  if (!out.length) throw new AppError(400, 'No valid ticker rows found')
  return out
}

export async function uploadFundamentals(userId: string, fileName: string, buffer: Buffer, runDate: string): Promise<FundamentalsUploadSummary> {
  const rows = parseRows(buffer)
  const universe = detectUniverse(fileName)

  const upload = await prisma.$transaction(async (tx) => {
    await tx.factorScorecardFundamentalsUpload.deleteMany({ where: { userId, universe, runDate } })
    const created = await tx.factorScorecardFundamentalsUpload.create({
      data: { userId, fileName, universe, runDate },
    })
    await tx.factorScorecardFundamental.createMany({
      data: rows.map((r) => ({
        userId,
        uploadId: created.id,
        ticker: r.ticker,
        sector: r.sector,
        cmp: r.cmp,
        pe: r.pe, pb: r.pb, roe: r.roe, roce: r.roce, debtToEquity: r.debtToEquity,
        revenueCagr3yr: r.revenueCagr3yr, profitCagr3yr: r.profitCagr3yr,
        dividendYieldPct: r.dividendYieldPct, payoutPct: r.payoutPct,
        promoterHoldingPct: r.promoterHoldingPct, fiiDiiHoldingPct: r.fiiDiiHoldingPct,
        beta: r.beta, notes: r.notes,
      })),
    })
    return created
  })

  return {
    id: upload.id,
    universe: upload.universe,
    runDate: upload.runDate,
    fileName: upload.fileName,
    rowCount: rows.length,
    createdAt: upload.createdAt.toISOString(),
  }
}

export async function listFundamentalsUploads(userId: string): Promise<FundamentalsUploadSummary[]> {
  const uploads = await prisma.factorScorecardFundamentalsUpload.findMany({
    where: { userId },
    orderBy: { runDate: 'desc' },
    include: { _count: { select: { rows: true } } },
  })
  return uploads.map((u) => ({
    id: u.id, universe: u.universe, runDate: u.runDate, fileName: u.fileName,
    rowCount: u._count.rows, createdAt: u.createdAt.toISOString(),
  }))
}

export async function getFundamentalRows(userId: string, uploadId: string): Promise<{ universe: string; runDate: string; rows: FundamentalInput[] }> {
  const upload = await prisma.factorScorecardFundamentalsUpload.findFirst({
    where: { id: uploadId, userId },
    include: { rows: true },
  })
  if (!upload) throw new AppError(404, 'Fundamentals upload not found')
  return {
    universe: upload.universe,
    runDate: upload.runDate,
    rows: upload.rows.map((r) => ({
      ticker: r.ticker, sector: r.sector, cmp: r.cmp, pe: r.pe, pb: r.pb, roe: r.roe, roce: r.roce,
      debtToEquity: r.debtToEquity, revenueCagr3yr: r.revenueCagr3yr, profitCagr3yr: r.profitCagr3yr,
      dividendYieldPct: r.dividendYieldPct, payoutPct: r.payoutPct, promoterHoldingPct: r.promoterHoldingPct,
      fiiDiiHoldingPct: r.fiiDiiHoldingPct, beta: r.beta, notes: r.notes,
    })),
  }
}
