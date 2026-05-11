import { useState } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PositionsTable } from '../components/trading/PositionsTable'
import { TradeHistoryTable } from '../components/trading/TradeHistoryTable'
import { PnLSummaryCards } from '../components/trading/PnLSummaryCards'
import { StockHoldingsTable } from '../components/trading/StockHoldingsTable'
import { usePositions, useTrades } from '../hooks/useTrades'
import { useHoldings } from '../hooks/useHoldings'
import type { Segment } from '../types/trade'

type Tab = 'positions' | 'history' | 'pnl' | 'holdings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'holdings',  label: 'Holdings' },
  { id: 'positions', label: 'Open Positions' },
  { id: 'history',   label: 'Trade History' },
  { id: 'pnl',       label: 'P&L Summary' },
]

const fyStart = () => {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return `${year}-04-01`
}

export default function TradingJournalPage() {
  const [tab, setTab] = useState<Tab>('holdings')

  const [symbolFilter, setSymbolFilter] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<Segment | ''>('')
  const [pnlFrom, setPnlFrom] = useState(fyStart)
  const [pnlTo, setPnlTo] = useState('')

  const { data: positions = [], isLoading: posLoading } = usePositions()
  const { data: trades = [], isLoading: tradesLoading } = useTrades({
    symbol: symbolFilter || undefined,
    segment: segmentFilter || undefined,
  })
  const { data: allHoldings = [], isLoading: holdingsLoading } = useHoldings()
  const stockHoldings = allHoldings.filter((h) => h.assetClass === 'STOCK' || h.assetClass === 'ETF')

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-theme-bg-alt rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary ${
                tab === t.id ? 'bg-theme-card text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'positions' && (
          posLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <PositionsTable positions={positions} />
          )
        )}

        {tab === 'history' && (
          tradesLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <TradeHistoryTable
              trades={trades}
              symbolFilter={symbolFilter}
              onSymbolChange={setSymbolFilter}
              segmentFilter={segmentFilter}
              onSegmentChange={setSegmentFilter}
            />
          )
        )}

        {tab === 'pnl' && (
          <PnLSummaryCards
            from={pnlFrom}
            to={pnlTo}
            onFromChange={setPnlFrom}
            onToChange={setPnlTo}
          />
        )}

        {tab === 'holdings' && (
          holdingsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <StockHoldingsTable holdings={stockHoldings} />
          )
        )}
      </div>

    </PageWrapper>
  )
}
