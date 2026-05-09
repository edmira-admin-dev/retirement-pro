import { useState } from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import type { WizardEntry } from '../wizardTypes'
import { formatRupeesCompact } from '../../../../utils/money'
import { MoneyInput } from '../../../ui/MoneyInput'

interface Props {
  entries: WizardEntry[]
  onAdd: (e: Omit<WizardEntry, 'localId' | 'stepKey'>) => void
  onRemove: (id: string) => void
  initialOpen?: boolean
}

const TYPES = ['Crude Oil', 'Natural Gas', 'Copper', 'Aluminium', 'Cotton', 'Agri / Other']
const FORMS = ['Commodity ETF', 'Commodity Mutual Fund', 'MCX Position', 'Spot / Physical']

const EMPTY = { assetType: 'Crude Oil', form: 'Commodity ETF', value: '', expectedReturn: '' }

export function StepCommodities({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  function handleAdd() {
    if (!form.value) return
    const cv = parseFloat(form.value) || 0
    onAdd({
      name: `${form.assetType} — ${form.form}`,
      assetClass: 'COMMODITY',
      currentValue: cv,
      investedValue: cv,
      expectedReturn: form.expectedReturn ? parseFloat(form.expectedReturn) : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Package size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Commodities</h3>
          <p className="text-sm text-theme-muted">Crude oil, agri, metals — ETFs, MFs, MCX positions</p>
        </div>
      </div>

      {entries.map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div>
            <p className="text-sm font-medium text-theme-text">{e.name}</p>
            <p className="text-xs text-theme-muted">{formatRupeesCompact(e.currentValue)}{e.expectedReturn ? ` · ${e.expectedReturn}%` : ''}</p>
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
              <label className="block text-xs font-medium text-theme-text mb-1">Commodity Type</label>
              <select value={form.assetType} onChange={(e) => setForm((p) => ({ ...p, assetType: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Form</label>
              <select value={form.form} onChange={(e) => setForm((p) => ({ ...p, form: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <MoneyInput
              label="Current Value"
              value={form.value}
              onChange={(v) => setForm((p) => ({ ...p, value: v }))}
            />
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Expected Return % <span className="text-theme-muted">(opt)</span></label>
              <input type="number" min={0} max={30} step={0.5} value={form.expectedReturn} onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))} placeholder="9" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.value} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add commodity
        </button>
      )}
    </div>
  )
}
