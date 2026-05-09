import { SliderInput } from '../SliderInput'
import { RupeeField } from '../RupeeField'
import type { IncomeInputs } from '../../../types/fire'

const DEFAULT_INCOME: IncomeInputs = {
  currentMonthlySalary: 0,
  salaryGrowthRate: 8,
  monthlyRentalIncome: 0,
  monthlyDividendIncome: 0,
  postRetirementPartTimeMonthly: 0,
}

interface IncomeTabProps {
  income: IncomeInputs | null
  onChange: (income: IncomeInputs | null) => void
  onBlur: () => void
}

export const IncomeTab = ({ income, onChange, onBlur }: IncomeTabProps) => {
  const data = income ?? DEFAULT_INCOME
  const enabled = income !== null

  const patch = (p: Partial<IncomeInputs>) => onChange({ ...data, ...p })

  const handleToggle = () => {
    if (enabled) {
      onChange(null)
    } else {
      onChange(DEFAULT_INCOME)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-theme-muted uppercase tracking-wider">Income Modeling</p>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            enabled
              ? 'bg-theme-primary text-white'
              : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'
          }`}
        >
          {enabled ? 'Enabled' : 'Off'}
        </button>
      </div>

      {!enabled && (
        <p className="text-xs text-theme-muted">
          Enable to model salary growth, passive income, and cashflow surplus.
        </p>
      )}

      {enabled && (
        <>
          <p className="text-xs text-theme-muted uppercase tracking-wider">Active Income</p>
          <RupeeField
            label="Monthly salary"
            value={data.currentMonthlySalary}
            onChange={(v) => patch({ currentMonthlySalary: v })}
            onBlur={onBlur}
          />
          <SliderInput
            label="Salary growth rate"
            value={data.salaryGrowthRate}
            min={0}
            max={20}
            step={0.5}
            unit="% pa"
            onChange={(v) => patch({ salaryGrowthRate: v })}
            onBlur={onBlur}
          />

          <div className="h-px bg-theme-border" />

          <p className="text-xs text-theme-muted uppercase tracking-wider">Passive Income</p>
          <RupeeField
            label="Monthly rental income"
            value={data.monthlyRentalIncome}
            onChange={(v) => patch({ monthlyRentalIncome: v })}
            onBlur={onBlur}
          />
          <RupeeField
            label="Monthly dividend income"
            value={data.monthlyDividendIncome}
            onChange={(v) => patch({ monthlyDividendIncome: v })}
            onBlur={onBlur}
          />

          <div className="h-px bg-theme-border" />

          <p className="text-xs text-theme-muted uppercase tracking-wider">Post-Retirement</p>
          <RupeeField
            label="Part-time income / mo (until 70)"
            value={data.postRetirementPartTimeMonthly}
            onChange={(v) => patch({ postRetirementPartTimeMonthly: v })}
            onBlur={onBlur}
          />
        </>
      )}
    </div>
  )
}
