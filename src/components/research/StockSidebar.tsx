import { useMemo, useState } from 'react'
import { Briefcase, Loader2, AlertCircle } from 'lucide-react'
import type { ResearchSnapshot } from '../../utils/parseResearchDoc'
import type { SnapshotRow } from '../../utils/parseSnapshot'
import type { StockHolding } from '../../hooks/useTradeBook'
import { findHoldingForTicker } from '../../utils/matchHolding'

function fmt (n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Row ({ label, value, valueClass = 'text-theme-text' }: { label: string; value?: string; valueClass?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-theme-border last:border-0">
      <span className="text-xs text-theme-muted">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

interface StockSidebarProps {
  ticker: string
  snapshot: ResearchSnapshot
  extraSnapshot: SnapshotRow[]
  holdings: StockHolding[]
  isLoading: boolean
  isError: boolean
}

export function StockSidebar ({ ticker, snapshot, extraSnapshot, holdings, isLoading, isError }: StockSidebarProps) {
  const [manualSymbol, setManualSymbol] = useState('')

  const autoMatch = useMemo(() => findHoldingForTicker(holdings, ticker), [holdings, ticker])
  const manualMatch = holdings.find(h => h.symbol === manualSymbol)
  const holding = autoMatch ?? manualMatch

  return (
    <div className="lg:sticky lg:top-4 space-y-4">
      <div className="bg-theme-card border border-theme-border rounded-xl p-4">
        <p className="text-sm font-semibold text-theme-text mb-1">Key Stats</p>
        <div>
          <Row label="CMP (report)" value={snapshot.cmp ? `₹${snapshot.cmp}` : undefined} />
          <Row label="Base Target" value={snapshot.baseTarget} />
          <Row label="Factor Score" value={snapshot.factorScore} />
          <Row label="Conviction" value={snapshot.conviction} />
          <Row label="Time Horizon" value={snapshot.timeHorizon} />
          <Row label="Market Cap" value={snapshot.marketCap} />
          {extraSnapshot.map(r => <Row key={r.metric} label={r.metric} value={r.value} />)}
        </div>
        <p className="text-xs text-theme-muted mt-2">As of {snapshot.asOfDate ?? '—'}</p>
      </div>

      <div className="bg-theme-card border border-theme-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={14} className="text-indigo-600" />
          <p className="text-sm font-semibold text-theme-text">Your Position</p>
        </div>

        {isLoading ? (
          <p className="flex items-center gap-1.5 text-sm text-theme-muted"><Loader2 size={13} className="animate-spin" /> Loading…</p>
        ) : isError ? (
          <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle size={13} /> Failed to load holdings.</p>
        ) : holding ? (
          <div>
            <Row label="Qty" value={String(holding.quantityAvailable)} />
            <Row label="Avg Price" value={fmt(holding.avgPrice)} />
            <Row label="LTP" value={fmt(holding.currentPrice)} />
            <Row
              label="Unrealized P&L"
              value={`${holding.unrealizedPnl >= 0 ? '+' : ''}${fmt(holding.unrealizedPnl)}`}
              valueClass={holding.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-500'}
            />
            <Row
              label="Return"
              value={`${holding.unrealizedPnlPct >= 0 ? '+' : ''}${holding.unrealizedPnlPct.toFixed(2)}%`}
              valueClass={holding.unrealizedPnlPct >= 0 ? 'text-green-600' : 'text-red-500'}
            />
          </div>
        ) : holdings.length === 0 ? (
          <p className="text-xs text-theme-muted">No holdings loaded — upload from Tradebook first.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-theme-muted">Not auto-matched to {ticker}. Pick your symbol:</p>
            <select
              value={manualSymbol}
              onChange={(e) => setManualSymbol(e.target.value)}
              className="w-full text-sm border border-theme-border rounded-lg px-2.5 py-1.5 bg-theme-card text-theme-text"
            >
              <option value="">Select your symbol…</option>
              {holdings.map(h => (
                <option key={h.id} value={h.symbol}>{h.symbol}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
