import { useState } from 'react'
import { Plus, Trash2, Landmark } from 'lucide-react'
import type { WizardEntry } from '../wizardTypes'
import { formatRupeesCompact } from '../../../../utils/money'
import { MoneyInput } from '../../../ui/MoneyInput'

interface Props {
  entries: WizardEntry[]
  onAdd: (e: Omit<WizardEntry, 'localId' | 'stepKey'>) => void
  onRemove: (id: string) => void
  initialOpen?: boolean
}

const EMPTY = { name: '', balance: '', expectedReturn: '' }

export function StepBank({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  function handleAdd() {
    if (!form.name || !form.balance) return
    onAdd({
      name: form.name,
      assetClass: 'BANK',
      currentValue: parseFloat(form.balance) || 0,
      investedValue: parseFloat(form.balance) || 0,
      expectedReturn: form.expectedReturn ? parseFloat(form.expectedReturn) : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
          <Landmark size={20} className="text-sky-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Bank Accounts & Cash</h3>
          <p className="text-sm text-theme-muted">Savings accounts, current accounts, and cash holdings</p>
        </div>
      </div>

      {entries.map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div>
            <p className="text-sm font-medium text-theme-text">{e.name}</p>
            <p className="text-xs text-theme-muted">{formatRupeesCompact(e.currentValue)}{e.expectedReturn ? ` · ${e.expectedReturn}% p.a.` : ''}</p>
          </div>
          <button onClick={() => onRemove(e.localId)} className="p-1.5 text-theme-muted hover:text-danger cursor-pointer transition-colors" aria-label="Remove">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {show ? (
        <div className="p-3 rounded-lg bg-theme-bg-alt border border-theme-primary/30 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Bank / Account Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. HDFC Savings" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
            <MoneyInput
              label="Balance"
              value={form.balance}
              onChange={(v) => setForm((p) => ({ ...p, balance: v }))}
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-medium text-theme-text mb-1">Expected Return % <span className="text-theme-muted">(opt, default 3–4%)</span></label>
            <input type="number" min={0} max={20} step={0.5} value={form.expectedReturn} onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))} placeholder="3.5" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || !form.balance} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add bank account
        </button>
      )}
    </div>
  )
}
