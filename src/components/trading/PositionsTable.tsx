import { TrendingUp, TrendingDown } from 'lucide-react'
import { LtpCell } from './LtpCell'
import { toRupees } from '../../utils/money'
import type { Position } from '../../types/trade'

interface PositionsTableProps {
  positions: Position[]
}

function pnlColor(paise: number) {
  if (paise > 0) return 'text-green-600'
  if (paise < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function fmtPrice(paise: number) {
  return `₹${toRupees(paise).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPnl(paise: number) {
  const prefix = paise >= 0 ? '+' : ''
  return `${prefix}₹${toRupees(paise).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PositionsTable({ positions }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <TrendingUp size={32} className="text-theme-muted opacity-40" />
        <p className="text-theme-muted text-sm">No open positions</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-theme-border">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-theme-border bg-theme-bg-alt">
            <th className="px-4 py-3 text-left font-semibold text-theme-muted text-xs uppercase tracking-wide">Symbol</th>
            <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Qty</th>
            <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Avg Buy</th>
            <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">LTP</th>
            <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Unrealized P&amp;L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border">
          {positions.map((p) => (
            <tr key={`${p.symbol}-${p.exchange}-${p.segment}`} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
              <td className="px-4 py-3">
                <p className="font-semibold text-theme-text">{p.symbol}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-theme-muted bg-theme-bg-alt px-1.5 py-0.5 rounded">{p.exchange}</span>
                  <span className="text-xs text-theme-muted bg-theme-bg-alt px-1.5 py-0.5 rounded">{p.segment}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium text-theme-text">{p.netQty}</td>
              <td className="px-4 py-3 text-right text-theme-text">{fmtPrice(p.avgBuyPricePaise)}</td>
              <td className="px-4 py-3 text-right">
                <LtpCell symbol={p.symbol} ltpPaise={p.ltpPaise} />
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`flex items-center justify-end gap-1 font-semibold ${pnlColor(p.unrealizedPnlPaise)}`}>
                  {p.unrealizedPnlPaise > 0 ? <TrendingUp size={13} /> : p.unrealizedPnlPaise < 0 ? <TrendingDown size={13} /> : null}
                  {fmtPnl(p.unrealizedPnlPaise)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
