import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { useAddIncome, useUpdateIncome } from '../../hooks/useIncome'
import { MoneyInput } from '../ui/MoneyInput'
import { toRupees, toPaise } from '../../utils/money'
import type { IncomeRecord, IncomeCategory, RecurringFrequency } from '../../types/income'

const CATEGORIES: IncomeCategory[] = ['SALARY', 'FREELANCE', 'RENTAL', 'DIVIDEND', 'BUSINESS', 'INTEREST', 'OTHER']
const CAT_LABELS: Record<IncomeCategory, string> = {
  SALARY: 'Salary', FREELANCE: 'Freelance', RENTAL: 'Rental',
  DIVIDEND: 'Dividend', BUSINESS: 'Business', INTEREST: 'Interest', OTHER: 'Other',
}
const FREQS: RecurringFrequency[] = ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME']
const FREQ_LABELS: Record<RecurringFrequency, string> = {
  MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', ANNUAL: 'Annual', ONE_TIME: 'One-time',
}

interface FormState {
  source: string
  amount: string
  category: IncomeCategory
  date: string
  recurring: boolean
  frequency: RecurringFrequency
  notes: string
}

function blank(): FormState {
  return { source: '', amount: '', category: 'SALARY', date: new Date().toISOString().slice(0, 10), recurring: false, frequency: 'MONTHLY', notes: '' }
}

function fromRecord(r: IncomeRecord): FormState {
  return { source: r.source, amount: String(toRupees(r.amountPaise)), category: r.category, date: r.date, recurring: r.recurring, frequency: r.frequency, notes: r.notes ?? '' }
}

interface IncomeFormProps {
  record: IncomeRecord | null
  onClose: () => void
}

export function IncomeForm({ record, onClose }: IncomeFormProps) {
  const { mutate: addIncome, isPending: adding } = useAddIncome()
  const { mutate: updateIncome, isPending: updating } = useUpdateIncome()
  const [form, setForm] = useState<FormState>(record ? fromRecord(record) : blank())

  useEffect(() => { setForm(record ? fromRecord(record) : blank()) }, [record])

  const isPending = adding || updating
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountPaise = toPaise(parseFloat(form.amount) || 0)
    if (amountPaise <= 0 || !form.source.trim()) return
    const payload = { source: form.source.trim(), amountPaise, category: form.category, date: form.date, recurring: form.recurring, frequency: form.frequency, notes: form.notes.trim() || null }
    if (record) updateIncome({ id: record.id, ...payload }, { onSuccess: onClose })
    else addIncome(payload, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-theme-card border border-theme-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 flex flex-col gap-5 max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-theme-text">{record ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary" aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="inc-source">Source</label>
            <input id="inc-source" type="text" value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="e.g. Infosys Ltd, Flat 2B rent" required className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyInput id="inc-amount" label="Amount" value={form.amount} onChange={(v) => set('amount', v)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="inc-date">Date</label>
              <input id="inc-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="inc-cat">Category</label>
            <select id="inc-cat" value={form.category} onChange={(e) => set('category', e.target.value as IncomeCategory)} className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
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

          {form.recurring && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-theme-muted" htmlFor="inc-freq">Frequency</label>
              <select id="inc-freq" value={form.frequency} onChange={(e) => set('frequency', e.target.value as RecurringFrequency)} className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer">
                {FREQS.map((f) => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-theme-muted" htmlFor="inc-notes">Notes <span className="font-normal">(opt)</span></label>
            <textarea id="inc-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Any additional details..." className="px-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary resize-none" />
          </div>

          <button type="submit" disabled={isPending || !form.source.trim() || !form.amount} className="w-full py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary">
            {isPending ? 'Saving…' : record ? 'Update' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  )
}
