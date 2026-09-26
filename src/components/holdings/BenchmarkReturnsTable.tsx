import { TrendingUp, AlertTriangle } from 'lucide-react'
import { useBenchmarkReturns, type ReturnPeriod } from '../../hooks/useMarket'
import type { ParsedEquityHolding } from '../../hooks/useEquityHoldings'

interface Props {
  holdings: ParsedEquityHolding[]
}

const PERIODS: ReturnPeriod[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y']

function fmtPct (n: number | undefined) {
  if (n === undefined) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function pctColor (n: number | undefined) {
  if (n === undefined) return 'text-theme-muted'
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

export function BenchmarkReturnsTable ({ holdings }: Props) {
  const returnsQuery = useBenchmarkReturns()

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0)
  const ourReturnPct = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
          <TrendingUp size={14} className="text-theme-muted" />
          Benchmark Comparison
        </h2>
        <p className="text-xs text-theme-muted">Index returns via Yahoo Finance</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-theme-border">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-2.5 py-1.5 text-left font-medium text-theme-muted">Benchmark</th>
              {PERIODS.map(p => (
                <th key={p} className="px-2 py-1.5 text-right font-medium text-theme-muted whitespace-nowrap">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            <tr className="bg-theme-bg-alt">
              <td className="px-2.5 py-1.5 font-semibold text-theme-text">Our Portfolio</td>
              {PERIODS.map(p => (
                <td key={p} className={`px-2 py-1.5 text-right font-semibold tabular-nums ${p === 'YTD' ? pctColor(ourReturnPct) : 'text-theme-muted'}`}>
                  {p === 'YTD' ? fmtPct(ourReturnPct) : '—'}
                </td>
              ))}
            </tr>
            {returnsQuery.isLoading && (
              <tr><td colSpan={PERIODS.length + 1} className="px-2.5 py-4 text-center text-theme-muted">Loading benchmark returns…</td></tr>
            )}
            {returnsQuery.data?.map(idx => (
              <tr key={idx.index} className="bg-theme-card">
                <td className="px-2.5 py-1.5 text-theme-text whitespace-nowrap">
                  {idx.label}
                  {idx.error && (
                    <span className="ml-1.5 inline-flex items-center gap-1 text-amber-600" title={idx.error}>
                      <AlertTriangle size={10} /> unavailable
                    </span>
                  )}
                  {idx.note && <span className="ml-1.5 text-theme-muted" title={idx.note}>(proxy)</span>}
                </td>
                {PERIODS.map(p => (
                  <td key={p} className={`px-2 py-1.5 text-right tabular-nums ${pctColor(idx.returns[p])}`}>
                    {fmtPct(idx.returns[p])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-theme-muted">
        "Our Portfolio" shows a single aggregate P&amp;L% (since each holding's own purchase) — no daily portfolio
        history is stored yet, so only YTD is populated for it (holdings started Jan 1, same as this year's YTD).
      </p>
    </div>
  )
}
