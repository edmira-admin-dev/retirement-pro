import fs from 'fs'
import path from 'path'
import { lookupSector } from './sector-master.service'

export type IndexKey = 'NIFTY50' | 'NIFTY_100' | 'NIFTY_NEXT_50' | 'NIFTY_MIDCAP_150' | 'NIFTY_500' | 'NIFTY500_MOMENTUM_50'

export interface IndexMeta {
  key: IndexKey
  label: string
  constituentCount: number
  file?: string
  weightsFile?: string
}

export const INDICES: IndexMeta[] = [
  { key: 'NIFTY50', label: 'Nifty 50', constituentCount: 50, weightsFile: 'nifty50-sector-weights.json' },
  { key: 'NIFTY_NEXT_50', label: 'Nifty Next 50', constituentCount: 50, file: 'ind_niftynext50.csv' },
  { key: 'NIFTY_100', label: 'Nifty 100', constituentCount: 100, weightsFile: 'nifty100-sector-weights.json' },
  { key: 'NIFTY_MIDCAP_150', label: 'Nifty Midcap 150', constituentCount: 150, weightsFile: 'niftymidcap150-sector-weights.json' },
  { key: 'NIFTY_500', label: 'Nifty 500', constituentCount: 500, weightsFile: 'nifty500-sector-weights.json' },
  { key: 'NIFTY500_MOMENTUM_50', label: 'Nifty500 Momentum 50', constituentCount: 50, weightsFile: 'nifty500momentum50-sector-weights.json' },
]

export interface SectorAllocationEntry {
  sector: string
  count: number
  weightPct: number
}

export interface IndexSectorAllocation {
  index: IndexKey
  label: string
  constituentCount: number
  sectors: SectorAllocationEntry[]
  asOfDate?: string
  source?: string
}

const DATA_DIR = path.join(__dirname, '..', 'data')

const symbolsByIndex = new Map<IndexKey, string[]>()

function loadSymbols (meta: IndexMeta): string[] {
  const cached = symbolsByIndex.get(meta.key)
  if (cached) return cached
  const text = fs.readFileSync(path.join(DATA_DIR, meta.file!), 'utf-8').replace(/^﻿/, '')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const headers = lines[0].split(',').map(h => h.trim().toUpperCase())
  const symbolIdx = headers.indexOf('SYMBOL')
  const symbols = lines.slice(1).map(l => l.split(',')[symbolIdx]?.trim().toUpperCase()).filter(Boolean)
  symbolsByIndex.set(meta.key, symbols)
  return symbols
}

interface WeightsFile {
  asOfDate: string
  source: string
  sectors: { sector: string; weightPct: number }[]
}

const weightsByIndex = new Map<IndexKey, WeightsFile>()

function loadWeightsFile (meta: IndexMeta): WeightsFile {
  const cached = weightsByIndex.get(meta.key)
  if (cached) return cached
  const text = fs.readFileSync(path.join(DATA_DIR, meta.weightsFile!), 'utf-8')
  const data = JSON.parse(text) as WeightsFile
  weightsByIndex.set(meta.key, data)
  return data
}

export function getIndexSectorAllocation (indexKey: IndexKey): IndexSectorAllocation {
  const meta = INDICES.find(i => i.key === indexKey)
  if (!meta) throw new Error(`Unknown index: ${indexKey}`)

  // Where NSE's fact sheet gives an official free-float market-cap weighted
  // sector table, use it verbatim rather than approximating weights by
  // constituent count.
  if (meta.weightsFile) {
    const data = loadWeightsFile(meta)
    return {
      index: meta.key,
      label: meta.label,
      constituentCount: meta.constituentCount,
      asOfDate: data.asOfDate,
      source: data.source,
      sectors: data.sectors.map(s => ({ ...s, count: 0 })).sort((a, b) => b.weightPct - a.weightPct),
    }
  }

  const symbols = loadSymbols(meta)
  const countBySector = new Map<string, number>()
  for (const symbol of symbols) {
    const { sector } = lookupSector(symbol)
    countBySector.set(sector, (countBySector.get(sector) ?? 0) + 1)
  }

  const sectors: SectorAllocationEntry[] = [...countBySector.entries()]
    .map(([sector, count]) => ({ sector, count, weightPct: (count / symbols.length) * 100 }))
    .sort((a, b) => b.weightPct - a.weightPct)

  return { index: meta.key, label: meta.label, constituentCount: symbols.length, sectors }
}
