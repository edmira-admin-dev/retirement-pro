import { Loader2, RefreshCw, Target } from 'lucide-react'
import { useSignalStats, useEvaluateSignals } from '../../hooks/useTradeSignals'

function StatTile({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="bg-theme-card rounded-lg px-3 py-2.5 border border-theme-border">
      <p className="text-xs text-theme-muted">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${cls ?? 'text-theme-text'}`}>{value}</p>
    </div>
  )
}

export default function SignalStatsPanel() {
  const { data: stats, isLoading } = useSignalStats()
  const evaluateMut = useEvaluateSignals()

  if (isLoading) return null
  if (!stats || stats.total === 0) return null

  return (
    <div className="bg-theme-bg-alt rounded-xl border border-theme-border p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-theme-primary" />
          <h2 className="text-sm font-bold text-theme-text">BUY Signal Success Ratio</h2>
        </div>
        <button
          onClick={() => evaluateMut.mutate()}
          disabled={evaluateMut.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-card border border-theme-border text-xs font-medium text-theme-text hover:bg-theme-bg disabled:opacity-50 transition-colors"
        >
          {evaluateMut.isPending
            ? <Loader2 size={13} className="animate-spin" />
            : <RefreshCw size={13} />}
          {evaluateMut.isPending ? 'Evaluating…' : 'Evaluate Outcomes'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <StatTile label="Total BUY Signals" value={String(stats.total)} />
        <StatTile label="Win Rate" value={`${stats.winRatePct.toFixed(1)}%`} cls={stats.winRatePct >= 50 ? 'text-green-600' : 'text-red-500'} />
        <StatTile label="Wins" value={String(stats.wins)} cls="text-green-600" />
        <StatTile label="Losses" value={String(stats.losses)} cls="text-red-500" />
        <StatTile label="Open" value={String(stats.open)} cls="text-amber-600" />
        <StatTile label="Expired" value={String(stats.expired)} cls="text-theme-muted" />
        <StatTile label="Avg Win Return" value={`+${stats.avgT2ReturnPct > 0 ? stats.avgT2ReturnPct.toFixed(1) : stats.avgT1ReturnPct.toFixed(1)}%`} cls="text-green-600" />
      </div>

      {stats.bySymbol.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="text-theme-muted uppercase tracking-wide border-b border-theme-border">
                <th className="text-left py-1.5 font-semibold">Symbol</th>
                <th className="text-right py-1.5 font-semibold">Signals</th>
                <th className="text-right py-1.5 font-semibold">W / L</th>
                <th className="text-right py-1.5 font-semibold">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySymbol.slice(0, 10).map(row => (
                <tr key={row.symbol} className="border-b border-theme-border last:border-0">
                  <td className="py-1.5 font-medium text-theme-text">{row.symbol}</td>
                  <td className="py-1.5 text-right text-theme-muted">{row.total}</td>
                  <td className="py-1.5 text-right text-theme-muted">{row.wins} / {row.losses}</td>
                  <td className={`py-1.5 text-right font-semibold ${row.winRatePct >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.winRatePct.toFixed(0)}%
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
