import { useState } from 'react'
import { Plus, Trash2, Globe } from 'lucide-react'
import type { WizardEntry } from '../wizardTypes'
import type { AssetClass } from '../../../../types/holdings'
import { formatRupeesCompact } from '../../../../utils/money'
import { AssetClassBadge } from '../../AssetClassBadge'
import { MoneyInput } from '../../../ui/MoneyInput'

interface Props {
  entries: WizardEntry[]
  onAdd: (e: Omit<WizardEntry, 'localId' | 'stepKey'>) => void
  onRemove: (id: string) => void
  initialOpen?: boolean
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'AED', 'AUD', 'CAD', 'INR']
const ASSET_TYPES: { label: string; value: AssetClass }[] = [
  { label: 'International Equity (Stocks / ETFs)',    value: 'INTL_EQUITY' },
  { label: 'International Debt / Savings / 401k/IRA', value: 'INTL_DEBT' },
]

const EMPTY = { assetType: 'INTL_EQUITY' as AssetClass, platform: '', country: '', valueLocal: '', currency: 'USD', inrValue: '', expectedReturn: '' }

export function StepInternational({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  function handleAdd() {
    if (!form.platform || !form.inrValue) return
    const cv = parseFloat(form.inrValue) || 0
    onAdd({
      name: `${form.platform}${form.country ? ` (${form.country})` : ''}`,
      assetClass: form.assetType,
      currentValue: cv,
      investedValue: cv,
      expectedReturn: form.expectedReturn ? parseFloat(form.expectedReturn) : undefined,
      currency: form.currency !== 'INR' ? form.currency : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <Globe size={20} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">International Investments</h3>
          <p className="text-sm text-theme-muted">US stocks, ETFs, 401k, IRA, overseas savings — enter INR equivalent</p>
        </div>
      </div>

      {entries.map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div className="flex items-center gap-2">
            <AssetClassBadge assetClass={e.assetClass} />
            <div>
              <p className="text-sm font-medium text-theme-text">{e.name}</p>
              <p className="text-xs text-theme-muted">{formatRupeesCompact(e.currentValue)}{e.currency ? ` · ${e.currency}` : ''}{e.expectedReturn ? ` · ${e.expectedReturn}%` : ''}</p>
            </div>
          </div>
          <button onClick={() => onRemove(e.localId)} className="p-1.5 text-theme-muted hover:text-danger cursor-pointer transition-colors" aria-label="Remove">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {show ? (
        <div className="p-3 rounded-lg bg-theme-bg-alt border border-theme-primary/30 space-y-3">
          <div>
            <label className="block text-xs font-medium text-theme-text mb-1">Asset Type</label>
            <select value={form.assetType} onChange={(e) => setForm((p) => ({ ...p, assetType: e.target.value as AssetClass }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
              {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Platform / Account</label>
              <input value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} placeholder="e.g. Vested, INDmoney, Schwab" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Country <span className="text-theme-muted">(opt)</span></label>
              <input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="e.g. USA" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Original Currency</label>
              <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <MoneyInput
              label="Value in ₹ (INR)"
              value={form.inrValue}
              onChange={(v) => setForm((p) => ({ ...p, inrValue: v }))}
            />
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Expected Return % <span className="text-theme-muted">(opt)</span></label>
              <input type="number" min={0} max={30} step={0.5} value={form.expectedReturn} onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))} placeholder="10" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.platform || !form.inrValue} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add international investment
        </button>
      )}
    </div>
  )
}
