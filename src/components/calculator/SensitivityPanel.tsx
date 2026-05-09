import { formatRupeesCompact } from '../../utils/money'
import type { SensitivityRow } from '../../types/fire'

interface TableProps {
  title: string
  rows: SensitivityRow[]
  currentLabel: string
  lifeExpectancy: number
}

const SensTable = ({ title, rows, currentLabel, lifeExpectancy }: TableProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-medium text-theme-text">{title}</p>
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[260px]">
        <thead>
          <tr className="border-b border-theme-border">
            {['Scenario', 'Target', 'Monthly SIP', 'Survival'].map((h) => (
              <th key={h} className="text-left text-theme-muted font-medium pb-1.5 pr-3 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isCurrent = row.label === currentLabel
            return (
              <tr
                key={row.label}
                className={`border-b border-theme-border/40 ${
                  isCurrent ? 'bg-theme-primary/8' : ''
                }`}
              >
                <td className={`py-1.5 pr-3 font-medium ${isCurrent ? 'text-theme-primary' : 'text-theme-muted'}`}>
                  {row.label}
                  {isCurrent && <span className="ml-1 text-[9px] text-theme-primary">◄</span>}
                </td>
                <td className="py-1.5 pr-3 font-mono text-theme-text">
                  {formatRupeesCompact(row.targetCorpus)}
                </td>
                <td className="py-1.5 pr-3 font-mono text-theme-text">
                  {formatRupeesCompact(row.monthlySip)}
                </td>
                <td
                  className={`py-1.5 font-mono ${
                    row.survivalAge === null
                      ? 'text-success'
                      : row.survivalAge < lifeExpectancy
                      ? 'text-danger'
                      : 'text-success'
                  }`}
                >
                  {row.survivalAge === null ? `>${lifeExpectancy}` : row.survivalAge}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

interface Props {
  withdrawalRateSensitivity: SensitivityRow[]
  inflationSensitivity: SensitivityRow[]
  currentWithdrawalRate: number
  currentInflation: number
  lifeExpectancy: number
}

export const SensitivityPanel = ({
  withdrawalRateSensitivity,
  inflationSensitivity,
  currentWithdrawalRate,
  currentInflation,
  lifeExpectancy,
}: Props) => {
  if (withdrawalRateSensitivity.length === 0 && inflationSensitivity.length === 0) return null

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-theme-text">Sensitivity Analysis</h2>
        <p className="text-xs text-theme-muted mt-0.5">
          Impact of changing key assumptions on your FIRE target
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {withdrawalRateSensitivity.length > 0 && (
          <SensTable
            title="Withdrawal Rate"
            rows={withdrawalRateSensitivity}
            currentLabel={`${currentWithdrawalRate}% SWR`}
            lifeExpectancy={lifeExpectancy}
          />
        )}
        {inflationSensitivity.length > 0 && (
          <SensTable
            title="General Inflation"
            rows={inflationSensitivity}
            currentLabel={`${currentInflation}% inflation`}
            lifeExpectancy={lifeExpectancy}
          />
        )}
      </div>
    </div>
  )
}
