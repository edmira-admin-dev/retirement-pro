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

export interface KiteHolding {
  tradingsymbol: string
  exchange: string
  isin: string
  product: string
  quantity: number
  t1_quantity: number
  average_price: number
  last_price: number
  close_price: number
  pnl: number
  day_change: number
  day_change_percentage: number
  collateral_quantity: number
  collateral_type: string | null
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
