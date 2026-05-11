import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { usePnLSummary } from '../../hooks/useTrades'
import { toRupees } from '../../utils/money'

interface PnLSummaryCardsProps {
  from: string
  to: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-theme-text">{value}</p>
    </div>
  )
}

function fmtPnl(paise: number) {
  const abs = Math.abs(toRupees(paise))
  const sign = paise < 0 ? '-' : paise > 0 ? '+' : ''
  return `${sign}₹${abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PnLSummaryCards({ from, to, onFromChange, onToChange }: PnLSummaryCardsProps) {
  const { data, isLoading } = usePnLSummary(from || undefined, to || undefined)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-theme-muted">
          From
          <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer" />
        </label>
        <label className="flex items-center gap-2 text-sm text-theme-muted">
          To
          <input type="date" value={to} onChange={(e) => onToChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer" />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Realized P&L"
            value={data ? fmtPnl(data.realizedPnlPaise) : '—'}
            icon={data && data.realizedPnlPaise >= 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-500" />}
            color={data && data.realizedPnlPaise >= 0 ? 'bg-green-50' : 'bg-red-50'}
          />
          <StatCard
            label="Unrealized P&L"
            value={data ? fmtPnl(data.unrealizedPnlPaise) : '—'}
            icon={data && data.unrealizedPnlPaise >= 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-500" />}
            color={data && data.unrealizedPnlPaise >= 0 ? 'bg-green-50' : 'bg-red-50'}
          />
          <StatCard
            label="Total Brokerage"
            value={data ? `₹${toRupees(data.totalBrokeragePaise).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            icon={<DollarSign size={16} className="text-amber-600" />}
            color="bg-amber-50"
          />
        </div>
      )}
    </div>
  )
}
