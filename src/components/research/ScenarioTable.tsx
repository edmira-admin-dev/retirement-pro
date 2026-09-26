import type { ParsedScenarios } from '../../utils/parseScenarios'

function scenarioClasses (scenario: string) {
  const s = scenario.toLowerCase()
  if (s === 'bull') return 'text-green-600'
  if (s === 'bear') return 'text-red-500'
  return 'text-amber-600'
}

export function ScenarioTable ({ scenarios }: { scenarios: ParsedScenarios }) {
  return (
    <table className="w-full table-fixed text-xs border-collapse">
      <colgroup>
        <col className="w-[16%]" />
        <col className="w-[16%]" />
        <col className="w-[16%]" />
        <col />
      </colgroup>
      <thead>
        <tr className="bg-theme-bg-alt text-theme-muted">
          <th className="text-left px-2.5 py-1.5 border border-theme-border font-semibold">Scenario</th>
          <th className="text-right px-2.5 py-1.5 border border-theme-border font-semibold">Target</th>
          <th className="text-right px-2.5 py-1.5 border border-theme-border font-semibold">Change</th>
          <th className="text-left px-2.5 py-1.5 border border-theme-border font-semibold">Commentary</th>
        </tr>
      </thead>
      <tbody>
        {scenarios.rows.map(row => (
          <tr key={row.scenario}>
            <td className={`px-2.5 py-1.5 border border-theme-border font-semibold break-words ${scenarioClasses(row.scenario)}`}>
              {row.scenario}
            </td>
            <td className="px-2.5 py-1.5 border border-theme-border text-right text-theme-text font-medium">
              {row.target ? `₹${row.target}` : '—'}
            </td>
            <td className={`px-2.5 py-1.5 border border-theme-border text-right font-semibold ${scenarioClasses(row.scenario)}`}>
              {row.changePct ?? '—'}
            </td>
            <td className="px-2.5 py-1.5 border border-theme-border align-top break-words">{row.commentary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
