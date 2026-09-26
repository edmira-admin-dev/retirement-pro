import type { BookRow } from '../../types/news'

export function BookTable({ rows }: { rows: BookRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-theme-muted py-8 text-center">No holdings found — upload your equity holdings to populate this view.</p>
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-theme-border text-[11px] text-theme-muted uppercase tracking-wide">
            <th className="text-left font-semibold px-4 py-2.5">Stock</th>
            <th className="text-right font-semibold px-3 py-2.5">Wt%</th>
            <th className="text-right font-semibold px-3 py-2.5">Day%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-b border-theme-border last:border-0 hover:bg-theme-bg-alt/60">
              <td className="px-4 py-2.5">
                <div className="font-semibold text-theme-text">{row.symbol}</div>
                <div className="text-xs text-theme-muted truncate max-w-[200px]">{row.companyName}</div>
              </td>
              <td className="px-3 py-2.5 text-right text-theme-text-sec">{row.weightPct.toFixed(1)}%</td>
              <td className={`px-3 py-2.5 text-right font-semibold ${row.dayChangePct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {row.dayChangePct >= 0 ? '+' : ''}{row.dayChangePct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
