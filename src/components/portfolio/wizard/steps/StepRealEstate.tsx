import { useState } from 'react'
import { Plus, Trash2, Building2 } from 'lucide-react'
import type { WizardEntry } from '../wizardTypes'
import { formatRupeesCompact } from '../../../../utils/money'
import { MoneyInput } from '../../../ui/MoneyInput'

interface Props {
  entries: WizardEntry[]
  onAdd: (e: Omit<WizardEntry, 'localId' | 'stepKey'>) => void
  onRemove: (id: string) => void
  initialOpen?: boolean
}

const TYPES = ['Primary Residence', 'Investment Property', 'Commercial', 'Plot / Land']

const EMPTY = { propertyType: 'Primary Residence', name: '', marketValue: '', loan: '', appreciation: '' }

export function StepRealEstate({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  function handleAdd() {
    if (!form.marketValue) return
    const mv = parseFloat(form.marketValue) || 0
    const loan = parseFloat(form.loan) || 0
    const equity = Math.max(0, mv - loan)
    onAdd({
      name: form.name || form.propertyType,
      assetClass: 'REAL_ESTATE',
      currentValue: equity,
      investedValue: equity,
      expectedReturn: form.appreciation ? parseFloat(form.appreciation) : undefined,
      loanAmount: loan > 0 ? loan : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-rose-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Real Estate</h3>
          <p className="text-sm text-theme-muted">Home, investment properties, plots — equity (value minus loan) is tracked</p>
        </div>
      </div>

      {entries.map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div>
            <p className="text-sm font-medium text-theme-text">{e.name}</p>
            <p className="text-xs text-theme-muted">
              Equity {formatRupeesCompact(e.currentValue)}
              {e.loanAmount ? ` · Loan ${formatRupeesCompact(e.loanAmount)}` : ''}
              {e.expectedReturn ? ` · ${e.expectedReturn}% appreciation` : ''}
            </p>
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
              <label className="block text-xs font-medium text-theme-text mb-1">Type</label>
              <select value={form.propertyType} onChange={(e) => setForm((p) => ({ ...p, propertyType: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Name / Location <span className="text-theme-muted">(opt)</span></label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Flat in Pune" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
            <MoneyInput
              label="Market Value"
              value={form.marketValue}
              onChange={(v) => setForm((p) => ({ ...p, marketValue: v }))}
            />
            <MoneyInput
              label="Outstanding Loan"
              optional
              value={form.loan}
              onChange={(v) => setForm((p) => ({ ...p, loan: v }))}
            />
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Annual Appreciation % <span className="text-theme-muted">(opt)</span></label>
              <input type="number" min={0} max={30} step={0.5} value={form.appreciation} onChange={(e) => setForm((p) => ({ ...p, appreciation: e.target.value }))} placeholder="5" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>
          {form.marketValue && form.loan && (
            <p className="text-xs text-theme-muted">
              Net equity = {formatRupeesCompact(Math.max(0, (parseFloat(form.marketValue) || 0) - (parseFloat(form.loan) || 0)))}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.marketValue} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add property
        </button>
      )}
    </div>
  )
}
