import type { ParsedScorecard } from '../../utils/parseScorecard'

function scoreClasses (score?: number) {
  if (score === undefined) return 'text-theme-text'
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-500'
}

export function ScorecardTable ({ scorecard }: { scorecard: ParsedScorecard }) {
  return (
    <div className="space-y-3">
      <table className="w-full table-fixed text-xs border-collapse">
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col />
        </colgroup>
        <thead>
          <tr className="bg-theme-bg-alt text-theme-muted">
            <th className="text-left px-2.5 py-1.5 border border-theme-border font-semibold">Factor</th>
            <th className="text-right px-2.5 py-1.5 border border-theme-border font-semibold">Weight</th>
            <th className="text-right px-2.5 py-1.5 border border-theme-border font-semibold">Score</th>
            <th className="text-right px-2.5 py-1.5 border border-theme-border font-semibold">Weighted</th>
            <th className="text-left px-2.5 py-1.5 border border-theme-border font-semibold">Commentary</th>
          </tr>
        </thead>
        <tbody>
          {scorecard.rows.map(row => (
            <tr key={row.factor}>
              <td className="px-2.5 py-1.5 border border-theme-border font-semibold text-theme-text break-words">{row.factor}</td>
              <td className="px-2.5 py-1.5 border border-theme-border text-right text-theme-muted">{row.weightPct !== undefined ? `${row.weightPct}%` : '—'}</td>
              <td className={`px-2.5 py-1.5 border border-theme-border text-right font-semibold ${scoreClasses(row.score)}`}>
                {row.score !== undefined ? `${row.score}/100` : '—'}
              </td>
              <td className="px-2.5 py-1.5 border border-theme-border text-right text-theme-muted">
                {row.weightPct !== undefined && row.score !== undefined
                  ? (row.weightPct * row.score / 100).toFixed(1)
                  : '—'}
              </td>
              <td className="px-2.5 py-1.5 border border-theme-border align-top break-words">{row.commentary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {scorecard.totalLine && (
        <div className="rounded-lg bg-theme-bg-alt border-l-4 border-theme-primary px-3 py-2 text-sm font-semibold text-theme-text">
          {scorecard.totalLine}
        </div>
      )}
    </div>
  )
}
