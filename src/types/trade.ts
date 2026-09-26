export type Exchange = 'NSE' | 'BSE'
export type Segment = 'EQ' | 'FO' | 'CDS' | 'MF'
export type TradeType = 'BUY' | 'SELL'
export type TradeSource = 'MANUAL' | 'KITE'

export interface Trade {
  id: string
  userId: string
  symbol: string
  exchange: Exchange
  segment: Segment
  tradeType: TradeType
  quantity: number
  pricePaise: number
  date: string
  brokeragePaise: number
  notes: string | null
  importedFrom: TradeSource | null
  createdAt: string
}

export interface Position {
  symbol: string
  exchange: Exchange
  segment: Segment
  netQty: number
  avgBuyPricePaise: number
  ltpPaise: number
  unrealizedPnlPaise: number
}

export interface PnLSummary {
  realizedPnlPaise: number
  unrealizedPnlPaise: number
  totalBrokeragePaise: number
}

export interface TradeFilters {
  symbol?: string
  segment?: Segment | ''
  from?: string
  to?: string
}

export interface TradePayload {
  symbol: string
  exchange: Exchange
  segment: Segment
  tradeType: TradeType
  quantity: number
  pricePaise: number
  date: string
  brokeragePaise?: number
  notes?: string | null
}
