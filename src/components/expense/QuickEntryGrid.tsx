import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useAddExpense, useExpenseSummary, type ExpensePayload } from '../../hooks/useExpenses'
import { toPaise, toRupees, formatRupeesCompact, rupeesToWords } from '../../utils/money'
import { InlineExpenseRow, CAT_LABELS } from './InlineExpenseRow'
import type { ExpenseType, ExpenseCategory, FixedCategory, DiscretionaryCategory, LoanCategory } from '../../types/expense'

const FIXED_CATS: FixedCategory[] = ['RENT', 'ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'GROCERY', 'COOK', 'DRIVER', 'MAID', 'INSURANCE', 'SUBSCRIPTIONS', 'FIXED_OTHER']
const DISC_CATS: DiscretionaryCategory[] = ['FOOD', 'TRANSPORT', 'HEALTHCARE', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'TRAVEL', 'INVESTMENT', 'DISC_OTHER']
const LOAN_CATS: LoanCategory[] = ['HOME_LOAN_EMI', 'CAR_LOAN_EMI', 'PERSONAL_LOAN_EMI', 'EDUCATION_LOAN_EMI', 'CREDIT_CARD_EMI', 'LOAN_OTHER']

interface ColConfig {
  type: ExpenseType
  cats: ExpenseCategory[]
  label: string
  color: string
  border: string
  tabBg: string
}

const COLS: ColConfig[] = [
  { type: 'FIXED', cats: FIXED_CATS, label: 'Fixed', color: 'text-blue-600', border: 'border-blue-200', tabBg: 'bg-blue-600' },
  { type: 'DISCRETIONARY', cats: DISC_CATS, label: 'Discretionary', color: 'text-amber-500', border: 'border-amber-200', tabBg: 'bg-amber-500' },
  { type: 'LOAN', cats: LOAN_CATS, label: 'Loan EMIs', color: 'text-purple-600', border: 'border-purple-200', tabBg: 'bg-purple-600' },
]

interface InlineAddState {
  category: ExpenseCategory | ''
  amount: string
  merchant: string
  date: string
}

interface QuickEntryGridProps {
  month: string
}

export function QuickEntryGrid({ month }: QuickEntryGridProps) {
  const { data: summary } = useExpenseSummary(month)
  const { mutate: addExpense, isPending } = useAddExpense()
  const [mobileTab, setMobileTab] = useState<ExpenseType>('FIXED')
  const [flashSet, setFlashSet] = useState<Set<string>>(new Set())
  const [inlineAddType, setInlineAddType] = useState<ExpenseType | null>(null)
  const [inlineAdd, setInlineAdd] = useState<InlineAddState | null>(null)

  const flash = useCallback((key: string) => {
    setFlashSet((prev) => { const n = new Set(prev); n.add(key); return n })
    setTimeout(() => setFlashSet((prev) => { const n = new Set(prev); n.delete(key); return n }), 1200)
  }, [])

  const handleQuickSave = useCallback((payload: ExpensePayload, key: string) => {
    addExpense(payload, { onSuccess: () => flash(key) })
  }, [addExpense, flash])

  function openInlineAdd(col: ColConfig) {
    setInlineAddType(col.type)
    setInlineAdd({ category: col.cats[0], amount: '', merchant: '', date: new Date().toISOString().slice(0, 10) })
  }

  function submitInlineAdd(type: ExpenseType) {
    if (!inlineAdd || !inlineAdd.category) return
    const amt = parseFloat(inlineAdd.amount.replace(/,/g, ''))
    if (isNaN(amt) || amt <= 0) return
    addExpense({
      merchant: inlineAdd.merchant.trim() || CAT_LABELS[inlineAdd.category as ExpenseCategory],
      amountPaise: toPaise(amt),
      expenseType: type,
      category: inlineAdd.category as ExpenseCategory,
      date: inlineAdd.date,
      recurring: false,
      notes: null,
    }, { onSuccess: () => { setInlineAddType(null); setInlineAdd(null) } })
  }

  return (
    <div>
      {/* Mobile tab switcher */}
      <div className="flex lg:hidden gap-1 p-1 bg-theme-card border border-theme-border rounded-xl mb-4">
        {COLS.map((col) => (
          <button key={col.type}
            onClick={() => { setMobileTab(col.type); setInlineAddType(null) }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${mobileTab === col.type ? `${col.tabBg} text-white` : 'text-theme-muted hover:text-theme-text'}`}
          >{col.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLS.map((col) => {
          const subtotal = toRupees(summary?.byType[col.type] ?? 0)
          return (
            <div key={col.type}
              className={`${col.type !== mobileTab ? 'hidden lg:flex' : 'flex'} flex-col bg-theme-card border ${col.border} rounded-xl overflow-hidden`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                {subtotal > 0 && (
                  <span className="text-xs font-mono font-semibold text-theme-muted">{formatRupeesCompact(subtotal)}</span>
                )}
              </div>

              {/* Category rows */}
              <div className="divide-y divide-theme-border flex-1 overflow-y-auto">
                {col.cats.map((cat) => (
                  <InlineExpenseRow
                    key={cat}
                    expenseType={col.type}
                    category={cat}
                    onQuickSave={handleQuickSave}
                    isPending={isPending}
                    isFlash={flashSet.has(cat)}
                  />
                ))}
              </div>

              {/* Footer — inline add form or button */}
              {inlineAddType === col.type && inlineAdd ? (
                <div className="p-3 border-t border-theme-border flex flex-col gap-2 bg-theme-bg-alt">
                  <select value={inlineAdd.category}
                    onChange={(e) => setInlineAdd((f) => f ? { ...f, category: e.target.value as ExpenseCategory } : f)}
                    className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer"
                  >
                    {col.cats.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <input type="text" inputMode="decimal" placeholder="Amount (₹)" value={inlineAdd.amount}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '')
                          const parts = raw.split('.')
                          const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw
                          if (clean === '' || clean === '.') { setInlineAdd((f) => f ? { ...f, amount: clean } : f); return }
                          const intPart = clean.includes('.') ? clean.split('.')[0] : clean
                          const decPart = clean.includes('.') ? '.' + (clean.split('.')[1] ?? '') : ''
                          setInlineAdd((f) => f ? { ...f, amount: Number(intPart).toLocaleString('en-IN') + decPart } : f)
                        }}
                        onBlur={() => {
                          if (!inlineAdd) return
                          const num = parseFloat(inlineAdd.amount.replace(/,/g, ''))
                          if (num > 0) setInlineAdd((f) => f ? { ...f, amount: num.toLocaleString('en-IN', { maximumFractionDigits: 2 }) } : f)
                        }}
                        className="px-2 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                      />
                      {parseFloat((inlineAdd.amount || '').replace(/,/g, '')) > 0 && (
                        <span className="text-[10px] text-theme-primary font-medium leading-tight px-1">{rupeesToWords(parseFloat(inlineAdd.amount.replace(/,/g, '')))}</span>
                      )}
                    </div>
                    <input type="text" placeholder="Merchant (opt)" value={inlineAdd.merchant}
                      onChange={(e) => setInlineAdd((f) => f ? { ...f, merchant: e.target.value } : f)}
                      className="px-2 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                    />
                  </div>
                  <input type="date" value={inlineAdd.date}
                    onChange={(e) => setInlineAdd((f) => f ? { ...f, date: e.target.value } : f)}
                    className="px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => submitInlineAdd(col.type)}
                      disabled={isPending || !inlineAdd.category || parseFloat((inlineAdd.amount || '').replace(/,/g, '')) <= 0}
                      className="flex-1 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >{isPending ? 'Saving…' : 'Add'}</button>
                    <button onClick={() => { setInlineAddType(null); setInlineAdd(null) }}
                      className="px-3 py-2 text-sm text-theme-muted hover:text-theme-text cursor-pointer"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => openInlineAdd(col)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium ${col.color} hover:bg-theme-bg-alt transition-colors cursor-pointer border-t border-theme-border`}
                >
                  <Plus size={13} /> Add {col.label}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
