export type TeTag = 'RBI' | 'FED' | 'MAJOR'

export interface TeEvent {
  id: number
  title: string
  description: string
  category: string
  country: string
  importance: number
  date: string
  url: string
  tag: TeTag
}

export interface PulseTile {
  label: string
  value: string
  changePct: number | null
}

export interface FiiDii {
  date: string
  fiiNetCr: number
  diiNetCr: number
}

export interface MarketPulse {
  indices: PulseTile[]
  global: PulseTile[]
  currency: PulseTile[]
  commodity: PulseTile[]
  yields: PulseTile[]
  fiiDii: FiiDii | null
}

export interface BookRow {
  symbol: string
  companyName: string
  weightPct: number
  dayChangePct: number
}

export interface WatchEvent {
  symbol: string
  companyName: string
  type: 'RESULTS' | 'CORP_ACTION'
  date: string
  detail: string
}

export interface DashboardResponse {
  marketPulse: MarketPulse
  book: BookRow[]
  watch: WatchEvent[]
  macro: TeEvent[]
  fetchedAt: string
}
