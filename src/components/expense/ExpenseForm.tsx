import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { useAddExpense, useUpdateExpense } from '../../hooks/useExpenses'
import { MoneyInput } from '../ui/MoneyInput'
import { toRupees, toPaise } from '../../utils/money'
import type { ExpenseRecord, ExpenseType, ExpenseCategory, FixedCategory, DiscretionaryCategory, LoanCategory } from '../../types/expense'

const FIXED_CATS: FixedCategory[] = ['RENT', 'ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'GROCERY', 'COOK', 'DRIVER', 'MAID', 'INSURANCE', 'SUBSCRIPTIONS', 'FIXED_OTHER']
const DISC_CATS: DiscretionaryCategory[] = ['FOOD', 'TRANSPORT', 'HEALTHCARE', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'TRAVEL', 'INVESTMENT', 'DISC_OTHER']
const LOAN_CATS: LoanCategory[] = ['HOME_LOAN_EMI', 'CAR_LOAN_EMI', 'PERSONAL_LOAN_EMI', 'EDUCATION_LOAN_EMI', 'CREDIT_CARD_EMI', 'LOAN_OTHER']

const CAT_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent', ELECTRICITY: 'Electricity', WATER: 'Water', GAS: 'Gas', INTERNET: 'Internet',
  GROCERY: 'Grocery', COOK: 'Cook', DRIVER: 'Driver', MAID: 'Maid', INSURANCE: 'Insurance',
  SUBSCRIPTIONS: 'Subscriptions', FIXED_OTHER: 'Other (Fixed)',
  FOOD: 'Food & Dining', TRANSPORT: 'Transport', HEALTHCARE: 'Healthcare', ENTERTAINMENT: 'Entertainment',
  SHOPPING: 'Shopping', EDUCATION: 'Education', TRAVEL: 'Travel', INVESTMENT: 'Investment', DISC_OTHER: 'Other (Discretionary)',
  HOME_LOAN_EMI: 'Home Loan EMI', CAR_LOAN_EMI: 'Car Loan EMI', PERSONAL_LOAN_EMI: 'Personal Loan EMI',
  EDUCATION_LOAN_EMI: 'Education Loan EMI', CREDIT_CARD_EMI: 'Credit Card EMI', LOAN_OTHER: 'Other (Loan)',
}

function catsForType(type: ExpenseType): ExpenseCategory[] {
  if (type === 'FIXED') return FIXED_CATS
  if (type === 'DISCRETIONARY') return DISC_CATS
  return LOAN_CATS
}

function defaultCat(type: ExpenseType): ExpenseCategory {
  return catsForType(type)[0]
}

interface FormState {
  merchant: string
  amount: string
  expenseType: ExpenseType
  category: ExpenseCategory
  date: string
  recurring: boolean
  notes: string
}

function blank(): FormState {
  return { merchant: '', amount: '', expenseType: 'FIXED', category: 'RENT', date: new Date().toISOString().slice(0, 10), recurring: false, notes: '' }
}

function fromRecord(r: ExpenseRecord): FormState {
  return { merchant: r.merchant, amount: String(toRupees(r.amountPaise)), expenseType: r.expenseType, category: r.category, date: r.date, recurring: r.recurring, notes: r.notes ?? '' }
}

interface ExpenseFormProps {
  record: ExpenseRecord | null
  onClose: () => void
}

export function ExpenseForm({ record, onClose }: ExpenseFormProps) {
  const { mutate: addExpense, isPending: adding } = useAddExpense()
  const { mutate: updateExpense, isPending: updating } = useUpdateExpense()
  const [form, setForm] = useState<FormState>(record ? fromRecord(record) : blank())

  useEffect(() => { setForm(record ? fromRecord(record) : blank()) }, [record])

  const isPending = adding || updating
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  function handleTypeChange(type: ExpenseType) {
    setForm((f) => ({ ...f, expenseType: type, category: defaultCat(type) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountPaise = toPaise(parseFloat(form.amount) || 0)
    if (amountPaise <= 0 || !form.merchant.trim()) return
    const payload = { merchant: form.merchant.trim(), amountPaise, expenseType: form.expenseType, category: form.category, date: form.date, recurring: form.recurring, notes: form.notes.trim() || null }
    if (record) updateExpense({ id: record.id, ...payload }, { onSuccess: onClose })
    else addExpense(payload, { onSuccess: onClose })
  }

  const cats = catsForType(form.expenseType)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-theme-card border border-theme-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 flex flex-col gap-5 max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-theme-text">{record ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary" aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Expense type pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-theme-muted">Expense Type</span>
            <div className="flex gap-2">
              {(['FIXED', 'DISCRETIONARY', 'LOAN'] as ExpenseType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                    form.expenseType === t
                      ? t === 'FIXED' ? 'bg-blue-600 text-white border-blue-600'
                        : t === 'DISCRETIONARY' ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-purple-600 text-white border-purple-600'
                      : 'bg-theme-bg-alt border-theme-border text-theme-muted hover:text-theme-text'
                  }`}
                >
                  {t === 'DISCRETIONARY' ? 'Disc.' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="exp-merchant">Merchant / Payee</label>
            <input id="exp-merchant" type="text" value={form.merchant} onChange={(e) => set('merchant', e.target.value)} placeholder="e.g. BigBasket, HDFC Bank" required className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyInput id="exp-amount" label="Amount" value={form.amount} onChange={(v) => set('amount', v)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="exp-date">Date</label>
              <input id="exp-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="exp-cat">Category</label>
            <select id="exp-cat" value={form.category} onChange={(e) => set('category', e.target.value as ExpenseCategory)} className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer">
              {cats.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" role="switch" aria-checked={form.recurring} onClick={() => set('recurring', !form.recurring)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary ${form.recurring ? 'bg-theme-primary' : 'bg-theme-border'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.recurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-theme-text font-medium flex items-center gap-1.5 select-none cursor-pointer" onClick={() => set('recurring', !form.recurring)}>
              <RefreshCw size={14} className="text-theme-muted" /> Recurring
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="exp-notes">Notes <span className="font-normal">(opt)</span></label>
            <textarea id="exp-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Any additional details..." className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary resize-none" />
          </div>

          <button type="submit" disabled={isPending || !form.merchant.trim() || !form.amount} className="w-full py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary">
            {isPending ? 'Saving…' : record ? 'Update' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
