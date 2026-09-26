import * as XLSX from 'xlsx'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ParsedTrade {
  symbol: string
  isin: string
  tradeDate: string
  exchange: string
  segment: string
  tradeType: string
  quantity: number
  price: number
  tradeId: string
  orderId: string
  executionTime: string
  isDuplicate?: boolean
}

export interface ParsedDividend {
  symbol: string
  isin: string
  exDate: string
  quantity: number
  dividendPerShare: number
  netAmount: number
  isDuplicate?: boolean
}

export interface ParsedCharge {
  periodFrom: string
  periodTo: string
  accountHead: string
  amount: number
  isDuplicate?: boolean
}

export interface ParsedHolding {
  symbol: string
  isin: string
  sector: string
  quantityAvailable: number
  quantityLongTerm: number
  avgPrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  asOfDate: string
  isDuplicate?: boolean
}

export interface ParsedRealizedPnl {
  symbol: string
  isin: string
  entryDate: string
  exitDate: string
  quantity: number
  buyValue: number
  sellValue: number
  profit: number
  holdingType: 'STCG' | 'LTCG' | 'INTRADAY'
  taxableProfit: number
  periodFrom: string
  periodTo: string
  charges?: number  // sum of all per-trade charge cols (STT, brokerage, etc.)
  isDuplicate?: boolean
}

export interface ParseResult {
  uploadType: 'TRADEBOOK_CSV' | 'AGTS_XLSX' | 'DIVIDEND_XLSX' | 'HOLDINGS_XLSX' | 'TAXPNL_XLSX' | 'HDFC_SKY_PNL' | 'ANGEL_ONE_PNL' | 'GROWW_CAPITAL_GAINS' | 'GROWW_DIVIDEND_PDF' | 'YES_BANK_PNL'
  fileName: string
  periodFrom?: string
  periodTo?: string
  trades: ParsedTrade[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
  realizedPnl: ParsedRealizedPnl[]
  newCount: number
  duplicateCount: number
}

// ── File-type detection ───────────────────────────────────────────────────────

function detectType (fileName: string, buffer?: Buffer): 'TRADEBOOK_CSV' | 'AGTS_XLSX' | 'DIVIDEND_XLSX' | 'HOLDINGS_XLSX' | 'TAXPNL_XLSX' | 'HDFC_SKY_PNL' | 'ANGEL_ONE_PNL' | 'GROWW_CAPITAL_GAINS' | 'GROWW_DIVIDEND_PDF' | 'YES_BANK_PNL' {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) return 'TRADEBOOK_CSV'
  // Groww-specific filenames
  if (lower.includes('stocks_capital_gains_report')) return 'GROWW_CAPITAL_GAINS'
  if (lower.includes('dividend_report') && lower.endsWith('.pdf')) return 'GROWW_DIVIDEND_PDF'
  if (lower.endsWith('.pdf')) return 'GROWW_DIVIDEND_PDF'
  // Yes Bank-specific filename: CapitalGain_Loss_DDMMYYYY_<clientid>.xlsx
  if (lower.includes('capitalgain_loss')) return 'YES_BANK_PNL'
  if (lower.includes('holdings')) return 'HOLDINGS_XLSX'
  if (lower.includes('taxpnl')) return 'TAXPNL_XLSX'
  if (lower.includes('dividend')) return 'DIVIDEND_XLSX'
  if (lower.includes('agts')) return 'AGTS_XLSX'
  // Content-based detection for XLSX files with generic names
  if (lower.endsWith('.xlsx') && buffer) {
    try {
      const wb = XLSX.read(buffer, { type: 'buffer' })
      if (wb.SheetNames.includes('Equity P&L Report')) return 'HDFC_SKY_PNL'
      if (wb.SheetNames.some(n => n.startsWith('Equity+Bonds+SGB'))) return 'ANGEL_ONE_PNL'
      if (wb.SheetNames.includes('CapitalGain_Loss')) return 'YES_BANK_PNL'
    } catch { /* fall through */ }
  }
  throw new AppError(400, `Cannot detect file type for "${fileName}". Upload a Zerodha taxpnl-*.xlsx, agts-*.xlsx, dividends-*.xlsx, holdings-*.xlsx, tradebook-*.csv, HDFC Sky "Profit & Loss.xlsx", Angel One "Tax PNL *.xlsx", Groww "Stocks_Capital_Gains_Report_*.xlsx", Groww "Dividend_Report_*.pdf", or Yes Bank "CapitalGain_Loss_*.xlsx"`)
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseTradebookCsv (buffer: Buffer): ParsedTrade[] {
  const text = buffer.toString('utf-8').replace(/^﻿/, '') // strip BOM
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const idx = (col: string) => headers.indexOf(col)

  const trades: ParsedTrade[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    const segment = cols[idx('segment')] ?? ''
    if (segment !== 'EQ') continue

    trades.push({
      symbol: cols[idx('symbol')] ?? '',
      isin: cols[idx('isin')] ?? '',
      tradeDate: cols[idx('trade_date')] ?? '',
      exchange: cols[idx('exchange')] ?? '',
      segment,
      tradeType: cols[idx('trade_type')] ?? '',
      quantity: parseFloat(cols[idx('quantity')] ?? '0'),
      price: parseFloat(cols[idx('price')] ?? '0'),
      tradeId: cols[idx('trade_id')] ?? '',
      orderId: cols[idx('order_id')] ?? '',
      executionTime: cols[idx('order_execution_time')] ?? '',
    })
  }
  return trades
}

function parseDateRange (text: string): { from: string; to: string } | null {
  const match = text?.match(/from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/)
  if (!match) return null
  return { from: match[1], to: match[2] }
}

function parseAgtsXlsx (buffer: Buffer): { charges: ParsedCharge[]; periodFrom: string; periodTo: string } {
  // Sheet ref starts at column B, so xlsx npm indexes: row[0]=colB, row[1]=colC, row[2]=colD, etc.
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const ws = wb.Sheets['Equity']
  if (!ws) throw new AppError(400, 'No "Equity" sheet found in AGTS file')

  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let periodFrom = ''
  let periodTo = ''
  const charges: ParsedCharge[] = []
  let inCharges = false

  for (const row of rows) {
    const b = String(row[0] ?? '').trim()  // column B = index 0
    const c = row[1]                        // column C = index 1 (Amount)

    if (b.includes('Annual Global Transaction Statement')) {
      const range = parseDateRange(b)
      if (range) { periodFrom = range.from; periodTo = range.to }
    }

    if (b === 'Account Head') { inCharges = true; continue }

    // End of charges: blank row, or Symbol header (start of holdings section)
    if (inCharges && (b === '' || b === 'Symbol')) { inCharges = false; continue }

    if (inCharges && b && c !== null && c !== undefined) {
      charges.push({ periodFrom, periodTo, accountHead: b, amount: Number(c) })
    }
  }

  return { charges, periodFrom, periodTo }
}

function parseDividendXlsx (buffer: Buffer): { dividends: ParsedDividend[]; periodFrom: string; periodTo: string } {
  // Sheet ref starts at column B, so xlsx npm indexes: row[0]=colB, row[1]=colC, ..., row[5]=colG
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const ws = wb.Sheets['Equity Dividends']
  if (!ws) throw new AppError(400, 'No "Equity Dividends" sheet found in dividend file')

  const rows: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let periodFrom = ''
  let periodTo = ''
  let headerRowIdx = -1
  const dividends: ParsedDividend[] = []

  for (let i = 0; i < rows.length; i++) {
    const b = String(rows[i][0] ?? '').trim()  // column B = index 0

    if (b.includes('Equity Dividends from')) {
      const range = parseDateRange(b)
      if (range) { periodFrom = range.from; periodTo = range.to }
    }

    if (b === 'Symbol') { headerRowIdx = i; continue }

    if (headerRowIdx >= 0 && i > headerRowIdx) {
      const row = rows[i]
      const symbol = String(row[0] ?? '').trim()  // colB
      if (!symbol || symbol === 'Total Dividend Amount') break

      const rawDate = row[2]  // colD = Ex-Date
      const exDate = rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : String(rawDate ?? '')

      dividends.push({
        symbol,
        isin: String(row[1] ?? ''),          // colC
        exDate,
        quantity: Number(row[3] ?? 0),        // colE
        dividendPerShare: Number(row[4] ?? 0),// colF
        netAmount: Number(row[5] ?? 0),       // colG
      })
    }
  }

  return { dividends, periodFrom, periodTo }
}

function parseHoldingsXlsx (buffer: Buffer): { holdings: ParsedHolding[]; asOfDate: string } {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const ws = wb.Sheets['Equity']
  if (!ws) throw new AppError(400, 'No "Equity" sheet found in Holdings file')

  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let asOfDate = ''
  let headerRowIdx = -1
  const holdings: ParsedHolding[] = []

  for (let i = 0; i < rows.length; i++) {
    const b = String(rows[i][0] ?? '').trim()

    if (b.includes('Equity Holdings Statement as on')) {
      const match = b.match(/as on (\d{4}-\d{2}-\d{2})/)
      if (match) asOfDate = match[1]
    }

    if (b === 'Symbol') { headerRowIdx = i; continue }

    if (headerRowIdx >= 0 && i > headerRowIdx) {
      const row = rows[i]
      const symbol = String(row[0] ?? '').trim()
      if (!symbol) break

      holdings.push({
        symbol,
        isin: String(row[1] ?? ''),
        sector: String(row[2] ?? ''),
        quantityAvailable: Number(row[3] ?? 0),
        quantityLongTerm: Number(row[5] ?? 0),
        avgPrice: Number(row[8] ?? 0),
        currentPrice: Number(row[9] ?? 0),
        unrealizedPnl: Number(row[10] ?? 0),
        unrealizedPnlPct: Number(row[11] ?? 0),
        asOfDate,
      })
    }
  }

  return { holdings, asOfDate }
}

// Charge columns start at index 12 in Tradewise Exits rows:
// 12=Brokerage, 13=Exchange Txn, 14=IPFT, 15=SEBI, 16=CGST, 17=SGST, 18=IGST, 19=Stamp Duty, 20=STT
const CHARGE_COL_START = 12
const CHARGE_COL_END   = 20

function sumRowCharges (row: (string | number | Date | null)[]): number {
  let total = 0
  for (let c = CHARGE_COL_START; c <= CHARGE_COL_END; c++) {
    total += Number(row[c] ?? 0)
  }
  return total
}

function parseTaxPnlXlsx (buffer: Buffer): { realizedPnl: ParsedRealizedPnl[]; dividends: ParsedDividend[]; charges: ParsedCharge[]; periodFrom: string; periodTo: string } {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  let periodFrom = ''
  let periodTo = ''

  const fmt = (v: string | number | Date | null): string => {
    if (!v) return ''
    if (v instanceof Date) return v.toISOString().slice(0, 10)
    return String(v)
  }

  // ── Tradewise Exits ──────────────────────────────────────────────────────────
  // Section headers → holdingType. Note: "Non Equity Short Term" has no dash!
  const SECTION_MAP: Record<string, string> = {
    'Equity - Intraday':     'INTRADAY',
    'Equity - Short Term':   'STCG',
    'Equity - Long Term':    'LTCG',
    'Non Equity Short Term': 'NON_EQ_STCG',
    'Non Equity Long Term':  'NON_EQ_LTCG',
    // with-dash variants for robustness
    'Non Equity - Short Term': 'NON_EQ_STCG',
    'Non Equity - Long Term':  'NON_EQ_LTCG',
  }

  // Headers that signal we should stop parsing (not in our scope)
  const SKIP_PATTERN = /^(Equity - Buyback|Mutual Funds|F&O|Futures|Options|Currency|Commodity)/i

  const exitsSheetName = wb.SheetNames.find(n => n.startsWith('Tradewise Exits')) ?? ''
  const exitsSheet = wb.Sheets[exitsSheetName]
  const realizedPnl: ParsedRealizedPnl[] = []

  if (exitsSheet) {
    const rows: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(exitsSheet, { header: 1, defval: null })
    let currentType: string | null = null
    let headerRowIdx = -1

    for (let i = 0; i < rows.length; i++) {
      const b = String(rows[i][0] ?? '').trim()

      // Extract period from title row
      if (b.startsWith('Tradewise Exits from')) {
        const m = b.match(/from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/)
        if (m) { periodFrom = m[1]; periodTo = m[2] }
        continue
      }

      if (SECTION_MAP[b] !== undefined) { currentType = SECTION_MAP[b]; headerRowIdx = -1; continue }
      if (SKIP_PATTERN.test(b))          { currentType = null; headerRowIdx = -1; continue }

      if (b === 'Symbol' && currentType) { headerRowIdx = i; continue }

      if (headerRowIdx >= 0 && i > headerRowIdx && currentType) {
        const row = rows[i]
        const symbol = String(row[0] ?? '').trim()
        const isin   = String(row[1] ?? '').trim()
        if (!symbol || !isin) { headerRowIdx = -1; continue }

        realizedPnl.push({
          symbol, isin,
          entryDate: fmt(row[2]), exitDate: fmt(row[3]),
          quantity:      Number(row[4]  ?? 0),
          buyValue:      Number(row[5]  ?? 0),
          sellValue:     Number(row[6]  ?? 0),
          profit:        Number(row[7]  ?? 0),
          holdingType:   currentType as 'STCG' | 'LTCG' | 'INTRADAY',
          taxableProfit: Number(row[10] ?? 0),
          charges:       sumRowCharges(row),
          periodFrom, periodTo,
        })
      }
    }
  }

  // ── Dividends & Interest ─────────────────────────────────────────────────────
  const divSheet = wb.Sheets['Dividends & Interest']
  const dividends: ParsedDividend[] = []

  if (divSheet) {
    const rows: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(divSheet, { header: 1, defval: null })
    let headerRowIdx = -1
    for (let i = 0; i < rows.length; i++) {
      const b = String(rows[i][0] ?? '').trim()
      if (b === 'Symbol') { headerRowIdx = i; continue }
      if (headerRowIdx >= 0 && i > headerRowIdx) {
        const row = rows[i]
        const symbol = String(row[0] ?? '').trim()
        const isin   = String(row[1] ?? '').trim()
        if (!symbol || !isin || symbol.startsWith('Total') || symbol.startsWith('Dividend') || symbol.startsWith('Interest')) break
        const rawDate = row[2]
        const exDate = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate ?? '')
        dividends.push({
          symbol, isin, exDate,
          quantity:          Number(row[3] ?? 0),
          dividendPerShare:  Number(row[4] ?? 0),
          netAmount:         Number(row[5] ?? 0),
        })
      }
    }
  }

  // ── Other Debits and Credits ─────────────────────────────────────────────────
  // Sheet: "Other Debits and Credits"
  // Columns: Particulars | Posting Date | Debit | Credit
  // Sections separated by segment headers: "Equity", "Mutual Funds", etc.
  const chargeSheetName = wb.SheetNames.find(n => {
    const l = n.toLowerCase()
    return l.includes('other debit') || l.includes('other credit') || l.includes('charge') || l === 'debits and credits'
  }) ?? ''
  const chargeSheet = wb.Sheets[chargeSheetName]
  const charges: ParsedCharge[] = []

  if (chargeSheet) {
    const rows: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(chargeSheet, { header: 1, defval: null })
    let chargeFrom = periodFrom
    let chargeTo   = periodTo
    let inEquity   = false

    for (const row of rows) {
      const col0 = String(row[0] ?? '').trim()

      // Extract period from sheet title
      if (col0.toLowerCase().includes('from') && col0.toLowerCase().includes('to')) {
        const m = col0.match(/from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/)
        if (m) { chargeFrom = m[1]; chargeTo = m[2] }
        continue
      }

      // Section headers - only capture Equity segment charges
      if (col0 === 'Equity') { inEquity = true; continue }
      if (/^(Mutual Funds|F&O|Futures|Currency|Commodity)/.test(col0)) { inEquity = false; continue }

      // Skip column header row
      if (col0 === 'Particulars') continue

      if (inEquity && col0) {
        const debit  = Number(row[2] ?? 0)  // col index 2 = Debit
        const credit = Number(row[3] ?? 0)  // col index 3 = Credit
        const net = debit - credit           // positive = net debit/charge
        if (net !== 0) {
          charges.push({ periodFrom: chargeFrom, periodTo: chargeTo, accountHead: col0, amount: net })
        }
      }
    }
  }

  return { realizedPnl, dividends, charges, periodFrom, periodTo }
}

// ── Angel One Tax P&L parser ─────────────────────────────────────────────────

function parseAngelOnePnlXlsx (buffer: Buffer): {
  realizedPnl: ParsedRealizedPnl[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  periodFrom: string
  periodTo: string
} {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const tradeSheetName = wb.SheetNames.find(n => n.startsWith('Equity+Bonds+SGB'))
  if (!tradeSheetName) throw new AppError(400, 'No "Equity+Bonds+SGB Trade Details" sheet found in Angel One file')

  const tradeRows: (string | number | null)[][] = XLSX.utils.sheet_to_json(wb.Sheets[tradeSheetName], { header: 1, defval: null })
  const realizedPnl: ParsedRealizedPnl[] = []
  let periodFrom = ''
  let periodTo = ''

  let mode: 'none' | 'intraday' | 'delivery' = 'none'

  for (const row of tradeRows) {
    const col0 = String(row[0] ?? '').trim()
    const col3 = String(row[3] ?? '').trim()

    // Detect section headers by characteristic column names
    if (col0 === 'ISIN' && col3 === 'Transaction Date') { mode = 'intraday'; continue }
    if (col0 === 'ISIN' && col3 === 'Buy Date')         { mode = 'delivery'; continue }
    // New ISIN header (another section) or totals row resets mode
    if (col0 === 'ISIN' || col0.startsWith('Sub Total') || col0.startsWith('Grand Total')) { mode = 'none'; continue }

    if (mode === 'none') continue
    // Skip blank / total rows inside sections
    if (!col0 || col0.startsWith('Total') || col0.startsWith('Sub Total')) { mode = 'none'; continue }

    const isin   = col0
    const symbol = String(row[1] ?? '').trim()
    if (!isin || !symbol) continue

    if (mode === 'intraday') {
      // Cols: ISIN | Scrip Name | Qty | Transaction Date | Avg Buy Price | Buy Value | Avg Sell Price | Sell Value | Charges | STT | Taxable P&L
      const qty       = Number(row[2] ?? 0)
      const txDate    = parseDDMMYYYY(String(row[3] ?? ''))
      const buyValue  = Number(row[5] ?? 0)
      const sellValue = Number(row[7] ?? 0)
      const charges   = Number(row[8] ?? 0) + Number(row[9] ?? 0)
      const profit    = Number(row[10] ?? 0)
      if (qty === 0 || !txDate) continue
      if (!periodFrom || txDate < periodFrom) periodFrom = txDate
      if (!periodTo   || txDate > periodTo)   periodTo   = txDate
      realizedPnl.push({
        symbol, isin, entryDate: txDate, exitDate: txDate,
        quantity: qty, buyValue, sellValue, profit,
        holdingType: 'INTRADAY', taxableProfit: profit,
        charges, periodFrom: txDate, periodTo: txDate,
      })
    } else {
      // Cols: ISIN | Scrip Name | Qty | Buy Date | Sell Date | Avg Buy Price | Buy Value | Avg Sell Price | Sell Value | Cost Of Acquisition | Charges | STT | Net Profit/Loss | Long term taxable income | Short term taxable income | ...
      const qty       = Number(row[2] ?? 0)
      const buyDate   = parseDDMMYYYY(String(row[3] ?? ''))
      const sellDate  = parseDDMMYYYY(String(row[4] ?? ''))
      const buyValue  = Number(row[6] ?? 0)
      const sellValue = Number(row[8] ?? 0)
      const charges   = Number(row[10] ?? 0) + Number(row[11] ?? 0)
      const profit    = Number(row[12] ?? 0)
      const ltcgAmt   = Number(row[13] ?? 0)
      const stcgAmt   = Number(row[14] ?? 0)
      if (qty === 0 || !buyDate || !sellDate) continue
      if (!periodFrom || buyDate < periodFrom) periodFrom = buyDate
      if (!periodTo   || sellDate > periodTo)  periodTo   = sellDate
      const holdingType: 'LTCG' | 'STCG' = ltcgAmt !== 0 ? 'LTCG' : 'STCG'
      const taxableProfit = ltcgAmt !== 0 ? ltcgAmt : stcgAmt
      realizedPnl.push({
        symbol, isin, entryDate: buyDate, exitDate: sellDate,
        quantity: qty, buyValue, sellValue, profit,
        holdingType, taxableProfit,
        charges, periodFrom: buyDate, periodTo: sellDate,
      })
    }
  }

  // Back-fill global period on each record
  for (const r of realizedPnl) {
    r.periodFrom = periodFrom
    r.periodTo   = periodTo
  }

  // ── Non Trade Charges ─────────────────────────────────────────────────────
  const chargeSheet = wb.Sheets['Non Trade Charges']
  const charges: ParsedCharge[] = []
  if (chargeSheet) {
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(chargeSheet, { header: 1, defval: null })
    let inCharges = false
    for (const row of rows) {
      const col0 = String(row[0] ?? '').trim()
      if (col0 === 'Charge') { inCharges = true; continue }
      if (inCharges && !col0) break
      if (!inCharges || !col0) continue
      const debit  = Number(row[2] ?? 0)
      const credit = Number(row[3] ?? 0)
      const net    = debit - credit
      if (net === 0) continue
      const postingDate = parseDDMMYYYY(String(row[1] ?? '').trim()) || periodFrom
      charges.push({ periodFrom: postingDate || periodFrom, periodTo: postingDate || periodTo, accountHead: col0, amount: net })
    }
  }

  // ── Dividend Report ────────────────────────────────────────────────────────
  const divSheet = wb.Sheets['Dividend Report']
  const dividends: ParsedDividend[] = []
  if (divSheet) {
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(divSheet, { header: 1, defval: null })
    let inDivs = false
    for (const row of rows) {
      const col0 = String(row[0] ?? '').trim()
      const col2 = String(row[2] ?? '').trim()
      if (col0 === 'ISIN' && col2 === 'Dividend Date') { inDivs = true; continue }
      if (inDivs && (!col0 || col0.startsWith('Total'))) break
      if (!inDivs || !col0) continue
      const exDate = parseDDMMYYYY(col2)
      dividends.push({
        symbol: String(row[1] ?? '').trim(),
        isin: col0,
        exDate,
        quantity: Number(row[3] ?? 0),
        dividendPerShare: Number(row[4] ?? 0),
        netAmount: Number(row[5] ?? 0),
      })
    }
  }

  return { realizedPnl, dividends, charges, periodFrom, periodTo }
}

// ── Check duplicates ──────────────────────────────────────────────────────────

// ── Groww Capital Gains XLSX parser ─────────────────────────────────────────

function parseGrowwCapitalGainsXlsx (buffer: Buffer): {
  realizedPnl: ParsedRealizedPnl[]
  charges: ParsedCharge[]
  periodFrom: string
  periodTo: string
} {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const ws = wb.Sheets['Sheet1']
  if (!ws) throw new AppError(400, 'No "Sheet1" found in Groww Capital Gains file')

  const rows: (string | number | Date | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let periodFrom = ''
  let periodTo   = ''

  // Row 3: "Capital Gains Statement for stocks from DD-MM-YYYY To DD-MM-YYYY"
  const titleRow = String(rows[3]?.[0] ?? '')
  const titleMatch = titleRow.match(/from (\d{2}-\d{2}-\d{4}) To (\d{2}-\d{2}-\d{4})/)
  if (titleMatch) {
    periodFrom = parseDDMMYYYY(titleMatch[1])
    periodTo   = parseDDMMYYYY(titleMatch[2])
  }

  // Charges: rows 7–17, col0 = name, col1 = amount. Skip "Total" row.
  const CHARGE_START = 7
  const charges: ParsedCharge[] = []
  for (let i = CHARGE_START; i < rows.length; i++) {
    const label = String(rows[i][0] ?? '').trim()
    const amt   = Number(rows[i][1] ?? 0)
    if (!label) break
    if (label === 'Total' || amt === 0) continue
    if (label === 'Realised P&L' || label === 'Summary') break
    charges.push({ periodFrom, periodTo, accountHead: label, amount: amt })
  }

  // Trade sections: "Intraday trades", "Short Term trades", "Long Term trades"
  const TYPE_MAP: Record<string, 'INTRADAY' | 'STCG' | 'LTCG'> = {
    'Intraday trades':    'INTRADAY',
    'Short Term trades':  'STCG',
    'Long Term trades':   'LTCG',
  }
  const STOP_SECTIONS = new Set(['Buyback trades', 'Disclaimer: '])

  const realizedPnl: ParsedRealizedPnl[] = []
  let currentType: 'INTRADAY' | 'STCG' | 'LTCG' | null = null
  let inData = false  // true after the column header row

  for (let i = 0; i < rows.length; i++) {
    const col0 = String(rows[i][0] ?? '').trim()

    if (TYPE_MAP[col0] !== undefined) { currentType = TYPE_MAP[col0]; inData = false; continue }
    if (STOP_SECTIONS.has(col0))      { currentType = null; inData = false; continue }
    if (!currentType) continue

    // Column header row
    if (col0 === 'Stock name') { inData = true; continue }
    if (!inData) continue

    // Data row: Stock name | ISIN | Qty | Buy date | Buy price | Buy value | Sell date | Sell price | Sell value | Realised P&L | Remark
    const symbol = col0
    if (!symbol) { inData = false; continue }

    const isin       = String(rows[i][1] ?? '').trim()
    const qty        = Number(rows[i][2] ?? 0)
    const buyDateRaw = String(rows[i][3] ?? '').trim()
    const buyValue   = Number(rows[i][5] ?? 0)
    const sellDateRaw= String(rows[i][6] ?? '').trim()
    const sellValue  = Number(rows[i][8] ?? 0)
    const profit     = Number(rows[i][9] ?? 0)

    if (qty === 0 || !buyDateRaw || !sellDateRaw) continue

    const entryDate = parseDDMMYYYY(buyDateRaw)
    const exitDate  = parseDDMMYYYY(sellDateRaw)

    realizedPnl.push({
      symbol, isin,
      entryDate, exitDate,
      quantity: qty, buyValue, sellValue, profit,
      holdingType: currentType,
      taxableProfit: profit,
      periodFrom, periodTo,
    })
  }

  return { realizedPnl, charges, periodFrom, periodTo }
}

// ── Groww Dividend PDF parser ────────────────────────────────────────────────

function parseDDMMYYYYDash (s: string): string {
  // "18-12-2025" → "2025-12-18"
  const parts = s.split('-').map(Number)
  if (parts.length !== 3) return s
  const [d, m, y] = parts
  if (!d || !m || !y) return s
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

async function parseGrowwDividendPdf (buffer: Buffer): Promise<{
  dividends: ParsedDividend[]
  periodFrom: string
  periodTo: string
}> {
  const { text } = await pdfParse(buffer)

  let periodFrom = ''
  let periodTo   = ''

  // Find period: "Equity dividends from DD-MM-YYYY to DD-MM-YYYY"
  const periodMatch = text.match(/Equity dividends from (\d{2}-\d{2}-\d{4}) to (\d{2}-\d{2}-\d{4})/)
  if (periodMatch) {
    periodFrom = parseDDMMYYYYDash(periodMatch[1])
    periodTo   = parseDDMMYYYYDash(periodMatch[2])
  }

  const dividends: ParsedDividend[] = []

  // pdf-parse emits each dividend as its own line with fields concatenated (NO
  // separators except the space after "Rs."):
  //   INDIAN OIL CORP LTDINE242A0101018-12-2025100Rs. 5.0Rs. 500.00
  // Fields: [COMPANY][ISIN][DD-MM-YYYY][QTY]Rs. [DPS]Rs. [AMOUNT]
  const rowRe = /^(.+?)(IN[A-Z0-9]{10})(\d{2}-\d{2}-\d{4})(\d[\d,]*)Rs\.\s*([\d.]+)Rs\.\s*([\d,.]+)$/

  for (const line of text.split('\n')) {
    const m = line.trim().match(rowRe)
    if (!m) continue
    const [, companyName, isin, rawDate, qtyStr, dpsStr, amtStr] = m
    dividends.push({
      symbol:           companyName.trim().replace(/\s+/g, ' '),
      isin,
      exDate:           parseDDMMYYYYDash(rawDate),
      quantity:         parseInt(qtyStr.replace(/,/g, ''), 10),
      dividendPerShare: parseFloat(dpsStr),
      netAmount:        parseFloat(amtStr.replace(/,/g, '')),
    })
  }

  return { dividends, periodFrom, periodTo }
}

async function flagDuplicateTrades (userId: string, trades: ParsedTrade[]): Promise<ParsedTrade[]> {
  if (!trades.length) return trades
  const existingIds = new Set(
    (await prisma.tradeRecord.findMany({
      where: { userId, tradeId: { in: trades.map(t => t.tradeId) } },
      select: { tradeId: true },
    })).map(r => r.tradeId)
  )
  return trades.map(t => ({ ...t, isDuplicate: existingIds.has(t.tradeId) }))
}

// ── HDFC Sky P&L parser ──────────────────────────────────────────────────────

function parseDDMMYYYY (s: string): string {
  // "17/07/2026" → "2026-07-17"
  const [d, m, y] = s.split('/').map(Number)
  if (!d || !m || !y) return s
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function hdfcHoldingType (buyDateStr: string, sellDateStr: string): 'STCG' | 'LTCG' | 'INTRADAY' {
  const buy  = new Date(parseDDMMYYYY(buyDateStr))
  const sell = new Date(parseDDMMYYYY(sellDateStr))
  if (buy.getTime() === sell.getTime()) return 'INTRADAY'
  const diffDays = (sell.getTime() - buy.getTime()) / 86400000
  return diffDays >= 365 ? 'LTCG' : 'STCG'
}

function parseHdfcSkyPnlXlsx (buffer: Buffer): { realizedPnl: ParsedRealizedPnl[]; charges: ParsedCharge[]; periodFrom: string; periodTo: string } {
  const wb   = XLSX.read(buffer, { type: 'buffer' })
  const ws   = wb.Sheets['Equity P&L Report']
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as unknown[][]

  // Extract period from summary rows (rows 5-6: From Date / To Date)
  let periodFrom = ''
  let periodTo   = ''
  for (const row of rows.slice(0, 10) as string[][]) {
    if (String(row[0]).trim() === 'From Date') periodFrom = parseDDMMYYYY(String(row[1]).trim())
    if (String(row[0]).trim() === 'To Date')   periodTo   = parseDDMMYYYY(String(row[1]).trim())
  }

  // Extract summary-level charges from rows 14-19 (Total Brokerage, Service Tax, etc.)
  const chargeMap: Record<string, number> = {}
  for (const row of rows.slice(0, 25) as unknown[][]) {
    const label = String(row[0]).trim()
    const value = Number(row[1]) || 0
    if (label.startsWith('Total Brokerage'))          chargeMap['Brokerage']           = value
    if (label.startsWith('Total Service Tax'))         chargeMap['Service Tax (GST)']   = value
    if (label.startsWith('Total Transaction Charges')) chargeMap['Transaction Charges'] = value
    if (label.startsWith('Total STT'))                 chargeMap['STT']                 = value
    if (label.startsWith('Total Other Charges'))       chargeMap['Other Charges']       = value
  }
  const charges: ParsedCharge[] = Object.entries(chargeMap)
    .filter(([, v]) => v > 0)
    .map(([accountHead, amount]) => ({ periodFrom, periodTo, accountHead, amount }))

  // Find header row (row with "ISIN" in col 0)
  let dataStart = -1
  for (let i = 0; i < rows.length; i++) {
    if (String((rows[i] as unknown[])[0]).trim() === 'ISIN') { dataStart = i + 1; break }
  }
  if (dataStart < 0) return { realizedPnl: [], charges, periodFrom, periodTo }

  // Data rows: ISIN, Company Name, Quantity, Buy Date, Avg Buy Price, Buy Value,
  //            Sell Date, Avg Sell Price, Sell Value, Gross PnL, Dividend Income,
  //            STT, Service Tax, Brokerage, Txn Charges, Other Charges
  const realizedPnl: ParsedRealizedPnl[] = []
  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i] as unknown[]
    const isin        = String(r[0] ?? '').trim()
    const companyName = String(r[1] ?? '').trim()
    if (!isin || isin === 'Total' || companyName === 'Total') break

    const quantity   = Number(r[2])  || 0
    const buyDateRaw = String(r[3] ?? '').trim()
    const buyValue   = Number(r[5])  || 0
    const sellDateRaw= String(r[6] ?? '').trim()
    const sellValue  = Number(r[8])  || 0
    const grossPnl   = Number(r[9])  || 0
    const stt        = Number(r[11]) || 0
    const serviceTax = Number(r[12]) || 0
    const brokerage  = Number(r[13]) || 0
    const txnCharges = Number(r[14]) || 0
    const otherChgs  = Number(r[15]) || 0
    const tradeCharges = stt + serviceTax + brokerage + txnCharges + otherChgs

    if (!buyDateRaw || !sellDateRaw || quantity === 0) continue

    const entryDate  = parseDDMMYYYY(buyDateRaw)
    const exitDate   = parseDDMMYYYY(sellDateRaw)
    const holdingType = hdfcHoldingType(buyDateRaw, sellDateRaw)

    realizedPnl.push({
      symbol:        companyName,  // HDFC gives company name, not NSE symbol — ISIN used for dedup
      isin,
      entryDate,
      exitDate,
      quantity,
      buyValue,
      sellValue,
      profit:        grossPnl,
      holdingType,
      taxableProfit: grossPnl,
      periodFrom,
      periodTo,
      charges:       tradeCharges,
    })
  }

  return { realizedPnl, charges, periodFrom, periodTo }
}

// ── Yes Bank Capital Gain/Loss parser ────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
}

function parseDMonY (s: string): string {
  // "11-NOV-2025" → "2025-11-11"
  const [d, mon, y] = s.split('-')
  const m = MONTH_MAP[mon?.toUpperCase() ?? '']
  if (!d || !m || !y) return s
  return `${y}-${m}-${d.padStart(2, '0')}`
}

function parseYesBankPnlXlsx (buffer: Buffer): { realizedPnl: ParsedRealizedPnl[]; periodFrom: string; periodTo: string } {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = wb.Sheets['CapitalGain_Loss']
  if (!ws) throw new AppError(400, 'No "CapitalGain_Loss" sheet found in Yes Bank file')

  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let periodFrom = ''
  let periodTo = ''
  let headerRowIdx = -1

  for (let i = 0; i < rows.length; i++) {
    const label = String(rows[i][0] ?? '').trim()
    if (label === 'Transaction Period') {
      const val = String(rows[i][1] ?? '')
      const m = val.match(/(\d{2}-\w{3}-\d{4})\s+to\s+(\d{2}-\w{3}-\d{4})/i)
      if (m) { periodFrom = parseDMonY(m[1]); periodTo = parseDMonY(m[2]) }
    }
    if (label === 'Sr. No') { headerRowIdx = i; break }
  }
  if (headerRowIdx < 0) throw new AppError(400, 'Could not find data header row in Yes Bank file')

  // Cols: 0 Sr No | 1 Scrip Name | 2 ISIN | 3 Buy Date | 4 Sell Date | 5 Quantity |
  //       6 Buy Price | 7 Buy Amount | 8 Sell Price | 9 Sell Amount |
  //       10 Intraday | 11 Short Term | 12 Long Term |
  //       13 GST | 14 Brokerage | 15 Misc. | 16 STT/CTT | 17 Total Charges
  const realizedPnl: ParsedRealizedPnl[] = []
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    const symbol = String(row[1] ?? '').trim()
    if (!symbol) break

    const isin = String(row[2] ?? '').trim()
    const buyDate  = parseDMonY(String(row[3] ?? '').trim())
    const sellDate = parseDMonY(String(row[4] ?? '').trim())
    const quantity = Number(row[5] ?? 0)
    const buyValue  = Number(row[7] ?? 0)
    const sellValue = Number(row[9] ?? 0)
    const intraday  = Number(row[10] ?? 0)
    const shortTerm = Number(row[11] ?? 0)
    const longTerm  = Number(row[12] ?? 0)
    const charges   = Number(row[17] ?? 0)

    let holdingType: 'STCG' | 'LTCG' | 'INTRADAY'
    let profit: number
    if (intraday !== 0) { holdingType = 'INTRADAY'; profit = intraday }
    else if (longTerm !== 0) { holdingType = 'LTCG'; profit = longTerm }
    else if (shortTerm !== 0) { holdingType = 'STCG'; profit = shortTerm }
    else { holdingType = 'STCG'; profit = shortTerm }

    if (!isin || quantity === 0) continue

    realizedPnl.push({
      symbol, isin, entryDate: buyDate, exitDate: sellDate,
      quantity, buyValue, sellValue, profit,
      holdingType, taxableProfit: profit,
      charges, periodFrom, periodTo,
    })
  }

  return { realizedPnl, periodFrom, periodTo }
}

async function flagDuplicateDividends (userId: string, dividends: ParsedDividend[]): Promise<ParsedDividend[]> {
  if (!dividends.length) return dividends
  const existing = await prisma.dividendRecord.findMany({
    where: {
      userId,
      OR: dividends.map(d => ({ isin: d.isin, exDate: d.exDate })),
    },
    select: { isin: true, exDate: true },
  })
  const existingKeys = new Set(existing.map(r => `${r.isin}|${r.exDate}`))
  return dividends.map(d => ({ ...d, isDuplicate: existingKeys.has(`${d.isin}|${d.exDate}`) }))
}

async function flagDuplicateCharges (userId: string, charges: ParsedCharge[]): Promise<ParsedCharge[]> {
  if (!charges.length) return charges
  const existing = await prisma.agtsCharge.findMany({
    where: {
      userId,
      OR: charges.map(c => ({ periodFrom: c.periodFrom, periodTo: c.periodTo, accountHead: c.accountHead })),
    },
    select: { periodFrom: true, periodTo: true, accountHead: true },
  })
  const existingKeys = new Set(existing.map(r => `${r.periodFrom}|${r.periodTo}|${r.accountHead}`))
  return charges.map(c => ({ ...c, isDuplicate: existingKeys.has(`${c.periodFrom}|${c.periodTo}|${c.accountHead}`) }))
}

async function flagDuplicateHoldings (userId: string, holdings: ParsedHolding[]): Promise<ParsedHolding[]> {
  if (!holdings.length) return holdings
  const existing = await prisma.stockHolding.findMany({
    where: { userId, OR: holdings.map(h => ({ symbol: h.symbol, isin: h.isin, asOfDate: h.asOfDate })) },
    select: { symbol: true, isin: true, asOfDate: true },
  })
  const keys = new Set(existing.map(r => `${r.symbol}|${r.isin}|${r.asOfDate}`))
  return holdings.map(h => ({ ...h, isDuplicate: keys.has(`${h.symbol}|${h.isin}|${h.asOfDate}`) }))
}

async function flagDuplicateRealizedPnl (userId: string, records: ParsedRealizedPnl[]): Promise<ParsedRealizedPnl[]> {
  if (!records.length) return records
  const existing = await prisma.realizedPnlRecord.findMany({
    where: {
      userId,
      OR: records.map(r => ({ symbol: r.symbol, isin: r.isin, entryDate: r.entryDate, exitDate: r.exitDate, holdingType: r.holdingType, quantity: r.quantity })),
    },
    select: { symbol: true, isin: true, entryDate: true, exitDate: true, holdingType: true, quantity: true },
  })
  const keys = new Set(existing.map(r => `${r.symbol}|${r.isin}|${r.entryDate}|${r.exitDate}|${r.holdingType}|${r.quantity}`))
  return records.map(r => ({ ...r, isDuplicate: keys.has(`${r.symbol}|${r.isin}|${r.entryDate}|${r.exitDate}|${r.holdingType}|${r.quantity}`) }))
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function parseFile (userId: string, fileName: string, buffer: Buffer): Promise<ParseResult> {
  const uploadType = detectType(fileName, buffer)
  let trades: ParsedTrade[] = []
  let dividends: ParsedDividend[] = []
  let charges: ParsedCharge[] = []
  let holdings: ParsedHolding[] = []
  let realizedPnl: ParsedRealizedPnl[] = []
  let periodFrom: string | undefined
  let periodTo: string | undefined

  if (uploadType === 'TRADEBOOK_CSV') {
    trades = await flagDuplicateTrades(userId, parseTradebookCsv(buffer))
  } else if (uploadType === 'DIVIDEND_XLSX') {
    const result = parseDividendXlsx(buffer)
    dividends = await flagDuplicateDividends(userId, result.dividends)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'HOLDINGS_XLSX') {
    const result = parseHoldingsXlsx(buffer)
    holdings = await flagDuplicateHoldings(userId, result.holdings)
    periodFrom = result.asOfDate
    periodTo = result.asOfDate
  } else if (uploadType === 'TAXPNL_XLSX') {
    const result = parseTaxPnlXlsx(buffer)
    realizedPnl = await flagDuplicateRealizedPnl(userId, result.realizedPnl)
    dividends = await flagDuplicateDividends(userId, result.dividends)
    charges = await flagDuplicateCharges(userId, result.charges)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'HDFC_SKY_PNL') {
    const result = parseHdfcSkyPnlXlsx(buffer)
    realizedPnl = await flagDuplicateRealizedPnl(userId, result.realizedPnl)
    charges = await flagDuplicateCharges(userId, result.charges)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'ANGEL_ONE_PNL') {
    const result = parseAngelOnePnlXlsx(buffer)
    realizedPnl = await flagDuplicateRealizedPnl(userId, result.realizedPnl)
    dividends = await flagDuplicateDividends(userId, result.dividends)
    charges = await flagDuplicateCharges(userId, result.charges)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'GROWW_CAPITAL_GAINS') {
    const result = parseGrowwCapitalGainsXlsx(buffer)
    realizedPnl = await flagDuplicateRealizedPnl(userId, result.realizedPnl)
    charges = await flagDuplicateCharges(userId, result.charges)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'GROWW_DIVIDEND_PDF') {
    const result = await parseGrowwDividendPdf(buffer)
    dividends = await flagDuplicateDividends(userId, result.dividends)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else if (uploadType === 'YES_BANK_PNL') {
    const result = parseYesBankPnlXlsx(buffer)
    realizedPnl = await flagDuplicateRealizedPnl(userId, result.realizedPnl)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  } else {
    const result = parseAgtsXlsx(buffer)
    charges = await flagDuplicateCharges(userId, result.charges)
    periodFrom = result.periodFrom
    periodTo = result.periodTo
  }

  const allRecords = [...trades, ...dividends, ...charges, ...holdings, ...realizedPnl]
  const duplicateCount = allRecords.filter(r => r.isDuplicate).length
  const newCount = allRecords.length - duplicateCount

  return { uploadType, fileName, periodFrom, periodTo, trades, dividends, charges, holdings, realizedPnl, newCount, duplicateCount }
}

export interface BatchSavePayload {
  fileNames: string[]
  trades: ParsedTrade[]
  dividends: ParsedDividend[]
  charges: ParsedCharge[]
  holdings: ParsedHolding[]
  realizedPnl: ParsedRealizedPnl[]
}

export async function saveBatch (
  userId: string,
  payload: BatchSavePayload
): Promise<{ created: number; updated: number }> {
  const upload = await prisma.tradeUpload.create({
    data: {
      userId,
      fileName: payload.fileNames.join(', '),
      uploadType: 'TRADEBOOK_CSV',
      periodFrom: payload.charges[0]?.periodFrom ?? payload.dividends[0]?.exDate ?? undefined,
      periodTo: payload.charges[0]?.periodTo ?? undefined,
    },
  })

  let created = 0
  let updated = 0

  await prisma.$transaction(async (tx) => {
    // ── Trades: unique on (userId, tradeId) ──
    for (const t of payload.trades) {
      const tradeData = {
        symbol: t.symbol, isin: t.isin ?? '', tradeDate: t.tradeDate,
        exchange: t.exchange, segment: t.segment, tradeType: t.tradeType,
        quantity: t.quantity, price: t.price,
        orderId: t.orderId ?? '', executionTime: t.executionTime ?? '',
      }
      const existing = await tx.tradeRecord.findUnique({
        where: { userId_tradeId: { userId, tradeId: t.tradeId } },
        select: { id: true },
      })
      if (existing) {
        await tx.tradeRecord.update({ where: { id: existing.id }, data: tradeData })
        updated++
      } else {
        await tx.tradeRecord.create({ data: { userId, uploadId: upload.id, tradeId: t.tradeId, ...tradeData } })
        created++
      }
    }

    // ── Dividends: unique on (userId, symbol, isin, exDate) ──
    for (const d of payload.dividends) {
      const divData = {
        quantity: d.quantity,
        dividendPerShare: d.dividendPerShare,
        netAmount: d.netAmount,
      }
      const existing = await tx.dividendRecord.findFirst({
        where: { userId, broker: null, symbol: d.symbol, isin: d.isin, exDate: d.exDate },
        select: { id: true },
      })
      if (existing) {
        await tx.dividendRecord.update({ where: { id: existing.id }, data: divData })
        updated++
      } else {
        await tx.dividendRecord.create({
          data: { userId, uploadId: upload.id, symbol: d.symbol, isin: d.isin, exDate: d.exDate, ...divData },
        })
        created++
      }
    }

    // ── Charges: unique on (userId, periodFrom, periodTo, accountHead) ──
    for (const c of payload.charges) {
      const existing = await tx.agtsCharge.findFirst({
        where: { userId, broker: null, periodFrom: c.periodFrom, periodTo: c.periodTo, accountHead: c.accountHead },
        select: { id: true },
      })
      if (existing) {
        await tx.agtsCharge.update({ where: { id: existing.id }, data: { amount: c.amount } })
        updated++
      } else {
        await tx.agtsCharge.create({
          data: { userId, uploadId: upload.id, periodFrom: c.periodFrom, periodTo: c.periodTo, accountHead: c.accountHead, amount: c.amount },
        })
        created++
      }
    }

    // ── Holdings: unique on (userId, symbol, isin, asOfDate) ──
    for (const h of payload.holdings) {
      const holdingData = {
        sector: h.sector, quantityAvailable: h.quantityAvailable, quantityLongTerm: h.quantityLongTerm,
        avgPrice: h.avgPrice, currentPrice: h.currentPrice, unrealizedPnl: h.unrealizedPnl, unrealizedPnlPct: h.unrealizedPnlPct,
      }
      const existing = await tx.stockHolding.findUnique({
        where: { userId_symbol_isin_asOfDate: { userId, symbol: h.symbol, isin: h.isin, asOfDate: h.asOfDate } },
        select: { id: true },
      })
      if (existing) {
        await tx.stockHolding.update({ where: { id: existing.id }, data: holdingData })
        updated++
      } else {
        await tx.stockHolding.create({ data: { userId, symbol: h.symbol, isin: h.isin, asOfDate: h.asOfDate, ...holdingData } })
        created++
      }
    }

    // ── Realized P&L: unique on (userId, symbol, isin, entryDate, exitDate, holdingType, quantity) ──
    for (const r of payload.realizedPnl) {
      const pnlData = {
        buyValue: r.buyValue, sellValue: r.sellValue, profit: r.profit, taxableProfit: r.taxableProfit,
        periodFrom: r.periodFrom, periodTo: r.periodTo,
      }
      const existing = await tx.realizedPnlRecord.findFirst({
        where: { userId, broker: null, symbol: r.symbol, isin: r.isin, entryDate: r.entryDate, exitDate: r.exitDate, holdingType: r.holdingType, quantity: r.quantity },
        select: { id: true },
      })
      if (existing) {
        await tx.realizedPnlRecord.update({ where: { id: existing.id }, data: pnlData })
        updated++
      } else {
        await tx.realizedPnlRecord.create({ data: { userId, symbol: r.symbol, isin: r.isin, entryDate: r.entryDate, exitDate: r.exitDate, quantity: r.quantity, holdingType: r.holdingType, ...pnlData } })
        created++
      }
    }
  })

  return { created, updated }
}

export async function getTrades (userId: string) {
  return prisma.tradeRecord.findMany({
    where: { userId },
    orderBy: [{ tradeDate: 'asc' }, { executionTime: 'asc' }],
  })
}

export async function getDividends (userId: string) {
  return prisma.dividendRecord.findMany({
    where: { userId },
    orderBy: { exDate: 'asc' },
  })
}

export async function getCharges (userId: string) {
  return prisma.agtsCharge.findMany({
    where: { userId },
    orderBy: [{ periodFrom: 'asc' }, { accountHead: 'asc' }],
  })
}

export async function getHoldings (userId: string) {
  return prisma.stockHolding.findMany({
    where: { userId },
    orderBy: [{ asOfDate: 'desc' }, { sector: 'asc' }, { symbol: 'asc' }],
  })
}

export async function getRealizedPnl (userId: string) {
  return prisma.realizedPnlRecord.findMany({
    where: { userId },
    orderBy: [{ exitDate: 'desc' }],
  })
}

export async function getDividendSummary (userId: string) {
  const records = await prisma.dividendRecord.findMany({
    where: { userId },
    orderBy: { exDate: 'asc' },
  })
  const total = records.reduce((sum, r) => sum + r.netAmount, 0)
  return { records, total }
}
