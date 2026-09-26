import { RefreshCw, Loader2 } from 'lucide-react'
import type { ParsedEquityHolding } from '../../hooks/useEquityHoldings'

interface Props {
  holdings: ParsedEquityHolding[]
  asOfDate?: string
  onRefresh: () => void
  isRefreshing: boolean
  mfInvested: number
  mfCurrent: number
}

function fmtINR (n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct (n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function pnlColor (n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function relativeDate (dateStr: string): string {
  const then = new Date(`${dateStr}T00:00:00`)
  const now = new Date()
  const days = Math.round((now.setHours(0, 0, 0, 0) - then.getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function EquityHoldingsSummary ({ holdings, asOfDate, onRefresh, isRefreshing, mfInvested, mfCurrent }: Props) {
  const equityInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const equityCurrent = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalInvested = equityInvested + mfInvested
  const totalCurrent = equityCurrent + mfCurrent
  const totalPnl = totalCurrent - totalInvested
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  // MF holdings carry no daily-change data, so today's P&L stays equity-only.
  const todaysPnl = holdings.reduce((s, h) => s + h.dayChange * h.quantity, 0)
  const prevValue = equityCurrent - todaysPnl
  const todaysPnlPct = prevValue > 0 ? (todaysPnl / prevValue) * 100 : 0

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl px-5 py-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div>
          <p className="text-xs text-theme-muted">Current Value</p>
          <p className="text-2xl font-bold text-theme-text mt-0.5">{fmtINR(totalCurrent)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted">Invested Amount</p>
          <p className="text-sm font-medium text-theme-text mt-1">{fmtINR(totalInvested)}</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted">Total P&L</p>
          <p className={`text-sm font-semibold mt-1 ${pnlColor(totalPnl)}`}>{totalPnl >= 0 ? '+' : ''}{fmtINR(totalPnl)} ({fmtPct(totalPnlPct)})</p>
        </div>
        <div>
          <p className="text-xs text-theme-muted">Today's P&L</p>
          <p className={`text-sm font-semibold mt-1 ${pnlColor(todaysPnl)}`}>{todaysPnl >= 0 ? '+' : ''}{fmtINR(todaysPnl)} ({fmtPct(todaysPnlPct)})</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-theme-muted pt-3 border-t border-theme-border">
        {asOfDate && <span>Last updated {relativeDate(asOfDate)}</span>}
        <span>·</span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer disabled:opacity-60"
        >
          {isRefreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh Holdings
        </button>
      </div>
    </div>
  )
}
