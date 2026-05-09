import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { SliderInput } from '../SliderInput'
import { RupeeField } from '../RupeeField'
import type { ExpenseCategory, RetirementAssumptions } from '../../../types/fire'

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { label: 'Housing / Rent', monthlyAmount: 0, inflationRate: 5 },
  { label: 'Food & Groceries', monthlyAmount: 0, inflationRate: 6 },
  { label: 'Transport', monthlyAmount: 0, inflationRate: 6 },
  { label: 'Education', monthlyAmount: 0, inflationRate: 8 },
  { label: 'Entertainment', monthlyAmount: 0, inflationRate: 5 },
]

interface ExpensesTabProps {
  expenses: ExpenseCategory[] | null
  assumptions: RetirementAssumptions
  onExpensesChange: (expenses: ExpenseCategory[] | null) => void
  onAssumptionsChange: (patch: Partial<RetirementAssumptions>) => void
  onBlur: () => void
}

export const ExpensesTab = ({
  expenses,
  assumptions,
  onExpensesChange,
  onAssumptionsChange,
  onBlur,
}: ExpensesTabProps) => {
  const [categorized, setCategorized] = useState(expenses !== null)

  const handleToggle = () => {
    const next = !categorized
    setCategorized(next)
    onExpensesChange(next ? (expenses ?? DEFAULT_CATEGORIES) : null)
  }

  const categories = expenses ?? DEFAULT_CATEGORIES

  const updateCategory = (i: number, patch: Partial<ExpenseCategory>) => {
    const updated = categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    onExpensesChange(updated)
  }

  const addCategory = () =>
    onExpensesChange([...categories, { label: 'Other', monthlyAmount: 0, inflationRate: 6 }])

  const removeCategory = (i: number) =>
    onExpensesChange(categories.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-theme-muted uppercase tracking-wider">Expense Mode</p>
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            categorized
              ? 'bg-theme-primary text-white'
              : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'
          }`}
        >
          {categorized ? 'Categorized' : 'Simple'}
        </button>
      </div>

      {categorized ? (
        <div className="flex flex-col gap-3">
          {categories.map((cat, i) => (
            <div key={i} className="border border-theme-border rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <input
                  value={cat.label}
                  onChange={(e) => updateCategory(i, { label: e.target.value })}
                  onBlur={onBlur}
                  className="text-sm font-medium text-theme-text bg-transparent border-b border-transparent hover:border-theme-border focus:border-theme-primary focus:outline-none w-full mr-2"
                />
                <button
                  onClick={() => removeCategory(i)}
                  className="text-theme-muted hover:text-red-500 transition-colors shrink-0"
                  aria-label="Remove category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <RupeeField
                label="Monthly amount"
                value={cat.monthlyAmount}
                onChange={(v) => updateCategory(i, { monthlyAmount: v })}
                onBlur={onBlur}
              />
              <SliderInput
                label="Inflation rate"
                value={cat.inflationRate}
                min={3}
                max={15}
                step={0.5}
                unit="%"
                onChange={(v) => updateCategory(i, { inflationRate: v })}
                onBlur={onBlur}
              />
            </div>
          ))}
          <button
            onClick={addCategory}
            className="flex items-center gap-2 text-sm text-theme-primary hover:opacity-80 transition-opacity"
          >
            <Plus size={14} /> Add category
          </button>
        </div>
      ) : (
        <p className="text-xs text-theme-muted">
          Using simple mode — enter Living + Medical on the Profile tab.
        </p>
      )}

      <div className="h-px bg-theme-border" />

      <p className="text-xs text-theme-muted uppercase tracking-wider">Inflation Assumptions</p>
      <SliderInput
        label="General inflation"
        value={assumptions.generalInflation}
        min={4}
        max={10}
        step={0.5}
        unit="% pa"
        onChange={(v) => onAssumptionsChange({ generalInflation: v })}
        onBlur={onBlur}
      />
      <SliderInput
        label="Medical inflation"
        value={assumptions.medicalInflation}
        min={7}
        max={15}
        step={0.5}
        unit="% pa"
        onChange={(v) => onAssumptionsChange({ medicalInflation: v })}
        onBlur={onBlur}
      />
    </div>
  )
}
