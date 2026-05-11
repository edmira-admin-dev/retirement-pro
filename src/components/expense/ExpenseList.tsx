import { useState } from 'react'
import { Pencil, Trash2, RefreshCw, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { useDeleteExpense } from '../../hooks/useExpenses'
import { formatRupees, toRupees } from '../../utils/money'
import type { ExpenseRecord, ExpenseType, ExpenseCategory } from '../../types/expense'

const TYPE_COLORS: Record<ExpenseType, string> = {
  FIXED: 'bg-blue-100 text-blue-700',
  DISCRETIONARY: 'bg-amber-100 text-amber-700',
  LOAN: 'bg-purple-100 text-purple-700',
}

const CAT_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent', ELECTRICITY: 'Electricity', WATER: 'Water', GAS: 'Gas', INTERNET: 'Internet',
  GROCERY: 'Grocery', COOK: 'Cook', DRIVER: 'Driver', MAID: 'Maid', INSURANCE: 'Insurance',
  SUBSCRIPTIONS: 'Subscriptions', FIXED_OTHER: 'Other',
  FOOD: 'Food', TRANSPORT: 'Transport', HEALTHCARE: 'Healthcare', ENTERTAINMENT: 'Entertainment',
  SHOPPING: 'Shopping', EDUCATION: 'Education', TRAVEL: 'Travel', INVESTMENT: 'Investment', DISC_OTHER: 'Other',
  HOME_LOAN_EMI: 'Home Loan', CAR_LOAN_EMI: 'Car Loan', PERSONAL_LOAN_EMI: 'Personal Loan',
  EDUCATION_LOAN_EMI: 'Education Loan', CREDIT_CARD_EMI: 'Credit Card', LOAN_OTHER: 'Other',
}

type SortKey = 'date' | 'amount'

interface ExpenseListProps {
  records: ExpenseRecord[]
  onEdit: (r: ExpenseRecord) => void
  search: string
  onSearchChange: (q: string) => void
}

export function ExpenseList({ records, onEdit, search, onSearchChange }: ExpenseListProps) {
  const { mutate: deleteExpense } = useDeleteExpense()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...records].sort((a, b) => {
    const d = sortKey === 'date' ? a.date.localeCompare(b.date) : a.amountPaise - b.amountPaise
    return sortAsc ? d : -d
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={11} className="text-theme-muted opacity-40" />
    return sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search merchant or notes…"
          className="w-full pl-8 pr-3 py-2 bg-theme-card border border-theme-border rounded-xl text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
        />
      </div>

      {records.length === 0 ? (
        <div className="bg-theme-card border border-theme-border rounded-xl p-12 text-center">
          <p className="text-theme-muted text-sm">No expense records for this period.</p>
          <p className="text-theme-muted text-xs mt-1">Click "Add Expense" to get started.</p>
        </div>
      ) : (
        <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme-border bg-theme-bg-alt">
                  <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted cursor-pointer select-none" onClick={() => toggleSort('date')}>
                    <span className="flex items-center gap-1">Date <SortIcon col="date" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted">Merchant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-theme-muted cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                    <span className="flex items-center justify-end gap-1">Amount <SortIcon col="amount" /></span>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-theme-muted">Rec.</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-theme-bg-alt transition-colors">
                    <td className="px-4 py-3 text-xs text-theme-muted font-mono whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 font-medium text-theme-text max-w-[160px] truncate">{r.merchant}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[r.expenseType]}`}>
                        {r.expenseType === 'DISCRETIONARY' ? 'Disc.' : r.expenseType.charAt(0) + r.expenseType.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-theme-muted">{CAT_LABELS[r.category]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-theme-text font-mono whitespace-nowrap">
                      {formatRupees(toRupees(r.amountPaise))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.recurring && <RefreshCw size={13} className="inline text-theme-primary" aria-label="Recurring" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {confirmId === r.id ? (
                          <>
                            <button onClick={() => { deleteExpense(r.id); setConfirmId(null) }} className="text-xs text-red-500 font-semibold hover:underline cursor-pointer px-1">Delete</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs text-theme-muted hover:text-theme-text cursor-pointer px-1">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onEdit(r)} aria-label="Edit" className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-bg-alt transition-colors cursor-pointer"><Pencil size={13} /></button>
                            <button onClick={() => setConfirmId(r.id)} aria-label="Delete" className="p-1.5 rounded-lg text-theme-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-theme-border">
            {sorted.map((r) => (
              <div key={r.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-theme-text">{r.merchant}</p>
                    <p className="text-xs text-theme-muted font-mono mt-0.5">{r.date}</p>
                  </div>
                  <span className="font-bold text-sm text-theme-text font-mono shrink-0">{formatRupees(toRupees(r.amountPaise))}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[r.expenseType]}`}>
                    {r.expenseType === 'DISCRETIONARY' ? 'Disc.' : r.expenseType.charAt(0) + r.expenseType.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-theme-muted">{CAT_LABELS[r.category]}</span>
                  {r.recurring && <RefreshCw size={12} className="text-theme-primary" aria-label="Recurring" />}
                </div>
                <div className="flex items-center gap-3 pt-0.5">
                  {confirmId === r.id ? (
                    <>
                      <button onClick={() => { deleteExpense(r.id); setConfirmId(null) }} className="text-xs text-red-500 font-semibold cursor-pointer">Confirm delete</button>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-theme-muted cursor-pointer">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onEdit(r)} className="text-xs text-theme-primary font-medium cursor-pointer">Edit</button>
                      <button onClick={() => setConfirmId(r.id)} className="text-xs text-red-400 font-medium cursor-pointer">Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
