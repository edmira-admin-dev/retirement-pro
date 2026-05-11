import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { IncomeStats } from '../components/income/IncomeStats'
import { IncomeList } from '../components/income/IncomeList'
import { IncomeForm } from '../components/income/IncomeForm'
import { useIncome } from '../hooks/useIncome'
import type { IncomeRecord, IncomeCategory } from '../types/income'

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'SALARY', label: 'Salary' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'RENTAL', label: 'Rental' },
  { value: 'DIVIDEND', label: 'Dividend' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'INTEREST', label: 'Interest' },
  { value: 'OTHER', label: 'Other' },
]

function now(): string {
  return new Date().toISOString().slice(0, 7)
}

function shift(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function IncomePage() {
  const [month, setMonth] = useState(now)
  const [category, setCategory] = useState<IncomeCategory | ''>('')
  const [editing, setEditing] = useState<IncomeRecord | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const { data: records = [], isLoading } = useIncome(month, category || undefined)

  function openEdit(r: IncomeRecord) { setEditing(r); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditing(null) }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold text-theme-text">Income Tracker</h1>
        {/* Month nav + Add button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth((m) => shift(m, -1))}
              className="p-2 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-theme-text min-w-[140px] text-center select-none">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth((m) => shift(m, 1))}
              disabled={month >= now()}
              className="p-2 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => { setEditing(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            <Plus size={15} />
            <span>Add Income</span>
          </button>
        </div>

        <IncomeStats month={month} />

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value as IncomeCategory | '')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category === opt.value
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <IncomeList records={records} onEdit={openEdit} />
        )}
      </div>

      {formOpen && <IncomeForm record={editing} onClose={closeForm} />}
    </PageWrapper>
  )
}
