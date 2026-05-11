import { TrendingUp, TrendingDown, Layers, Wifi } from 'lucide-react'
import type { KiteHolding } from '../../types/trade'

interface Props {
  holdings: KiteHolding[]
}

function fmtPrice(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pnlColor(n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function fmtPnl(n: number) {
  const prefix = n >= 0 ? '+' : ''
  return `${prefix}₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function ZerodhaConnectedBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg w-fit">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Wifi size={13} className="text-green-600" />
      <span className="text-xs font-semibold text-green-700">Zerodha Connected</span>
    </div>
  )
}

export function KiteHoldingsTable({ holdings }: Props) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <ZerodhaConnectedBadge />
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Layers size={32} className="text-theme-muted opacity-40" />
          <p className="text-theme-muted text-sm">No holdings found in your Kite account</p>
        </div>
      </div>
    )
  }

  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0)
  const totalInvested = holdings.reduce((sum, h) => sum + h.average_price * h.quantity, 0)
  const totalCurrent = holdings.reduce((sum, h) => sum + h.last_price * h.quantity, 0)

  return (
    <div className="flex flex-col gap-4">
      <ZerodhaConnectedBadge />
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Invested</p>
          <p className="text-base font-semibold text-theme-text">{fmtPrice(totalInvested)}</p>
        </div>
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Current</p>
          <p className="text-base font-semibold text-theme-text">{fmtPrice(totalCurrent)}</p>
        </div>
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Total P&L</p>
          <p className={`text-base font-semibold flex items-center gap-1 ${pnlColor(totalPnl)}`}>
            {totalPnl > 0 ? <TrendingUp size={14} /> : totalPnl < 0 ? <TrendingDown size={14} /> : null}
            {fmtPnl(totalPnl)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-theme-border bg-theme-bg-alt">
              <th className="px-4 py-3 text-left font-semibold text-theme-muted text-xs uppercase tracking-wide">Symbol</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Qty</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Avg Price</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">LTP</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">P&amp;L</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Day Chg%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {holdings.map((h) => (
              <tr key={h.tradingsymbol} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-theme-text">{h.tradingsymbol}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-theme-muted bg-theme-bg-alt px-1.5 py-0.5 rounded">{h.exchange}</span>
                    <span className="text-xs text-theme-muted bg-theme-bg-alt px-1.5 py-0.5 rounded">{h.product}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-theme-text">
                  {h.quantity}
                  {h.t1_quantity > 0 && (
                    <span className="text-xs text-amber-500 ml-1">(+{h.t1_quantity} T1)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-theme-text">{fmtPrice(h.average_price)}</td>
                <td className="px-4 py-3 text-right text-theme-text">{fmtPrice(h.last_price)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${pnlColor(h.pnl)}`}>{fmtPnl(h.pnl)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`flex items-center justify-end gap-0.5 font-medium ${pnlColor(h.day_change)}`}>
                    {h.day_change > 0 ? <TrendingUp size={12} /> : h.day_change < 0 ? <TrendingDown size={12} /> : null}
                    {h.day_change_percentage >= 0 ? '+' : ''}{h.day_change_percentage.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
