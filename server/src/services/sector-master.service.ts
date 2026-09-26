import fs from 'fs'
import path from 'path'

export interface SectorInfo {
  companyName: string
  sector: string
  industry: string
  subSector: string
}

const CSV_PATH = path.join(__dirname, '..', 'data', 'sector-master.csv')

// The master CSV uses these literal placeholder strings for rows it hasn't
// classified — treat them the same as "not found" rather than showing them verbatim.
function normalizeField (v: string): string {
  const t = v.trim()
  if (!t || /^unclassified$/i.test(t) || /^not provided$/i.test(t)) return 'Uncategorized'
  return t
}

// Handles quoted fields containing commas, e.g. "Tour, Travel Related Services"
function parseCsvLine (line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { fields.push(cur); cur = '' } else { cur += ch }
  }
  fields.push(cur)
  return fields
}

let bySymbol: Map<string, SectorInfo> | null = null

function load (): Map<string, SectorInfo> {
  if (bySymbol) return bySymbol
  const map = new Map<string, SectorInfo>()
  const text = fs.readFileSync(CSV_PATH, 'utf-8').replace(/^﻿/, '')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toUpperCase())
  const symbolIdx = headers.indexOf('SYMBOL')
  const nameIdx = headers.indexOf('SECURITY NAME')
  const industryIdx = headers.indexOf('INDUSTRY')
  const sectorIdx = headers.indexOf('SECTOR')
  const subSectorIdx = headers.indexOf('SUB SECTOR')

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const symbol = cols[symbolIdx]?.trim().toUpperCase()
    if (!symbol) continue
    map.set(symbol, {
      companyName: cols[nameIdx]?.trim() || symbol,
      sector: normalizeField(cols[sectorIdx] ?? ''),
      industry: normalizeField(cols[industryIdx] ?? ''),
      subSector: normalizeField(cols[subSectorIdx] ?? ''),
    })
  }
  bySymbol = map
  return map
}

export function lookupSector (symbol: string): SectorInfo {
  const map = load()
  const key = symbol.trim().toUpperCase()
  return map.get(key) ?? { companyName: symbol, sector: 'Uncategorized', industry: 'Uncategorized', subSector: 'Uncategorized' }
}
