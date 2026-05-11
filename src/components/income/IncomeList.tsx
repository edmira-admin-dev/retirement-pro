import { useState } from 'react'
import { Pencil, Trash2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'
import { useDeleteIncome } from '../../hooks/useIncome'
import { formatRupees, toRupees } from '../../utils/money'
import type { IncomeRecord, IncomeCategory } from '../../types/income'

const CAT_COLORS: Record<IncomeCategory, string> = {
  SALARY: 'bg-blue-100 text-blue-700',
  FREELANCE: 'bg-purple-100 text-purple-700',
  RENTAL: 'bg-amber-100 text-amber-700',
  DIVIDEND: 'bg-green-100 text-green-700',
  BUSINESS: 'bg-rose-100 text-rose-700',
  INTEREST: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-600',
}

const CAT_LABELS: Record<IncomeCategory, string> = {
  SALARY: 'Salary', FREELANCE: 'Freelance', RENTAL: 'Rental',
  DIVIDEND: 'Dividend', BUSINESS: 'Business', INTEREST: 'Interest', OTHER: 'Other',
}

type SortKey = 'date' | 'amount'

interface IncomeListProps {
  records: IncomeRecord[]
  onEdit: (r: IncomeRecord) => void
}

export function IncomeList({ records, onEdit }: IncomeListProps) {
  const { mutate: deleteIncome } = useDeleteIncome()
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

  if (records.length === 0) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-12 text-center">
        <p className="text-theme-muted text-sm">No income records for this period.</p>
        <p className="text-theme-muted text-xs mt-1">Click "Add Income" to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-border bg-theme-bg-alt">
              <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted cursor-pointer select-none" onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1">Date <SortIcon col="date" /></span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-theme-muted">Source</th>
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
                <td className="px-4 py-3 font-medium text-theme-text">{r.source}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[r.category]}`}>{CAT_LABELS[r.category]}</span>
                </td>
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
                        <button onClick={() => { deleteIncome(r.id); setConfirmId(null) }} className="text-xs text-red-500 font-semibold hover:underline cursor-pointer px-1">Delete</button>
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

      {/* Mobile */}
      <div className="sm:hidden divide-y divide-theme-border">
        {sorted.map((r) => (
          <div key={r.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm text-theme-text">{r.source}</p>
                <p className="text-xs text-theme-muted font-mono mt-0.5">{r.date}</p>
              </div>
              <span className="font-bold text-sm text-theme-text font-mono shrink-0">{formatRupees(toRupees(r.amountPaise))}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[r.category]}`}>{CAT_LABELS[r.category]}</span>
              {r.recurring && <RefreshCw size={12} className="text-theme-primary" aria-label="Recurring" />}
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              {confirmId === r.id ? (
                <>
                  <button onClick={() => { deleteIncome(r.id); setConfirmId(null) }} className="text-xs text-red-500 font-semibold cursor-pointer">Confirm delete</button>
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
  )
}
