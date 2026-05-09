import { ChevronDown, ChevronUp } from 'lucide-react'
import { useFireUIStore } from '../../stores/fireUIStore'
import { formatRupeesCompact } from '../../utils/money'
import type { FireInputs, ExpenseCategory } from '../../types/fire'

interface InflationBreakdownProps {
  inputs: FireInputs
  yearsToRetirement: number
  categories?: ExpenseCategory[] | null
  generalInflation?: number
  medicalInflation?: number
}

export const InflationBreakdown = ({
  inputs,
  yearsToRetirement,
  categories,
  generalInflation = 6,
  medicalInflation = 12,
}: InflationBreakdownProps) => {
  const { inflationExpanded, toggleInflation } = useFireUIStore()

  const rows = categories
    ? categories.map((cat) => ({
        label: cat.label,
        rate: `${cat.inflationRate}%`,
        today: cat.monthlyAmount,
        future: cat.monthlyAmount * Math.pow(1 + cat.inflationRate / 100, yearsToRetirement),
      }))
    : [
        {
          label: 'General Living',
          rate: `${generalInflation}%`,
          today: inputs.currentMonthlyExpense,
          future:
            inputs.currentMonthlyExpense * Math.pow(1 + generalInflation / 100, yearsToRetirement),
        },
        {
          label: 'Medical',
          rate: `${medicalInflation}%`,
          today: inputs.medicalMonthlyExpense,
          future:
            inputs.medicalMonthlyExpense *
            Math.pow(1 + medicalInflation / 100, yearsToRetirement),
        },
      ]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
      <button
        onClick={toggleInflation}
        aria-expanded={inflationExpanded}
        aria-controls="inflation-body"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-theme-border/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary"
      >
        <span className="text-sm font-medium text-theme-text">Inflation Breakdown</span>
        {inflationExpanded ? (
          <ChevronUp size={16} className="text-theme-muted" />
        ) : (
          <ChevronDown size={16} className="text-theme-muted" />
        )}
      </button>

      {inflationExpanded && (
        <div id="inflation-body" className="px-5 pb-5 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 text-xs text-theme-muted pb-2 border-b border-theme-border">
            <span>Category</span>
            <span className="text-right">Today /mo</span>
            <span className="text-right">At retirement /mo</span>
          </div>

          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-3 gap-2 items-center">
              <div>
                <p className="text-sm text-theme-text">{row.label}</p>
                <p className="text-xs text-theme-muted">{row.rate} inflation</p>
              </div>
              <p className="text-right text-sm font-mono text-theme-muted">
                {formatRupeesCompact(row.today)}
              </p>
              <p className="text-right text-sm font-mono text-theme-text font-medium">
                {formatRupeesCompact(row.future)}
              </p>
            </div>
          ))}

          <p className="text-xs text-theme-muted pt-2 border-t border-theme-border">
            Projecting {yearsToRetirement} years of inflation
          </p>
        </div>
      )}
    </div>
  )
}
