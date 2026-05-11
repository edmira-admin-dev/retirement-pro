import { useState } from 'react'
import { Pencil, Trash2, BookOpen } from 'lucide-react'
import { useDeleteTrade } from '../../hooks/useTrades'
import { toRupees } from '../../utils/money'
import type { Trade, Segment } from '../../types/trade'

interface TradeHistoryTableProps {
  trades: Trade[]
  onEdit?: (t: Trade) => void
  symbolFilter: string
  onSymbolChange: (v: string) => void
  segmentFilter: Segment | ''
  onSegmentChange: (v: Segment | '') => void
}

const SEGMENTS: { value: Segment | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'EQ', label: 'EQ' },
  { value: 'FO', label: 'F&O' },
  { value: 'CDS', label: 'CDS' },
  { value: 'MF', label: 'MF' },
]

function fmtPrice(paise: number) {
  return `₹${toRupees(paise).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TradeHistoryTable({
  trades, onEdit, symbolFilter, onSymbolChange, segmentFilter, onSegmentChange,
}: TradeHistoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteTrade, isPending: isDeleting } = useDeleteTrade()

  function confirmDelete(id: string) {
    deleteTrade(id, { onSuccess: () => setDeletingId(null) })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={symbolFilter}
          onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
          placeholder="Symbol…"
          className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary w-32"
          aria-label="Filter by symbol"
        />
        <div className="flex items-center gap-1.5">
          {SEGMENTS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSegmentChange(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                segmentFilter === s.value
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <BookOpen size={32} className="text-theme-muted opacity-40" />
          <p className="text-theme-muted text-sm">No trades found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-theme-border">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-theme-border bg-theme-bg-alt">
                <th className="px-4 py-3 text-left font-semibold text-theme-muted text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-theme-muted text-xs uppercase tracking-wide">Symbol</th>
                <th className="px-4 py-3 text-left font-semibold text-theme-muted text-xs uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide">Brokerage</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {trades.map((t) => (
                <tr key={t.id} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                  <td className="px-4 py-3 text-theme-muted">{t.date}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-theme-text">{t.symbol}</p>
                    <span className="text-xs text-theme-muted">{t.exchange} · {t.segment}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      t.tradeType === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {t.tradeType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-theme-text">{t.quantity}</td>
                  <td className="px-4 py-3 text-right text-theme-text">{fmtPrice(t.pricePaise)}</td>
                  <td className="px-4 py-3 text-right text-theme-muted">{t.brokeragePaise ? fmtPrice(t.brokeragePaise) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {deletingId === t.id ? (
                        <>
                          <button onClick={() => confirmDelete(t.id)} disabled={isDeleting} className="text-xs text-red-500 font-semibold cursor-pointer hover:text-red-700 disabled:opacity-50">
                            {isDeleting ? 'Deleting…' : 'Confirm'}
                          </button>
                          <button onClick={() => setDeletingId(null)} className="text-xs text-theme-muted cursor-pointer hover:text-theme-text">Cancel</button>
                        </>
                      ) : (
                        <>
                          {onEdit && <button onClick={() => onEdit(t)} className="text-theme-muted hover:text-theme-primary cursor-pointer" aria-label="Edit trade"><Pencil size={14} /></button>}
                          <button onClick={() => setDeletingId(t.id)} className="text-theme-muted hover:text-red-500 cursor-pointer" aria-label="Delete trade"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
