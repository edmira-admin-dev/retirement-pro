import { useState } from 'react'
import { Plus, Trash2, Shield } from 'lucide-react'
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

const CATEGORIES: { label: string; value: AssetClass; placeholder: string }[] = [
  { label: 'NPS (National Pension Scheme)',  value: 'NPS',     placeholder: 'e.g. NPS Tier I – Equity' },
  { label: 'EPF (Employee Provident Fund)', value: 'EPF',     placeholder: 'e.g. EPFO Account' },
  { label: 'PPF (Public Provident Fund)',   value: 'PPF',     placeholder: 'e.g. PPF – SBI' },
  { label: 'Annuity / Pension Plan',        value: 'ANNUITY', placeholder: 'e.g. LIC Jeevan Akshay' },
]

const DEFAULT_RATES: Record<AssetClass, string> = {
  NPS: '10', EPF: '8.25', PPF: '7.1', ANNUITY: '6',
  MF: '', STOCK: '', ETF: '', BOND: '', FD: '',
  BANK: '', LIQUID: '', GOLD: '', REAL_ESTATE: '', INTL_EQUITY: '', INTL_DEBT: '',
  COMMODITY: '',
}

const EMPTY = { category: 'NPS' as AssetClass, name: '', balance: '', expectedReturn: '', currentAge: '' }

export function StepRetirement({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  const currentCat = CATEGORIES.find((c) => c.value === form.category)!

  const balance = parseFloat(form.balance) || 0
  const rate = parseFloat(form.expectedReturn) || 0
  const age = parseInt(form.currentAge) || 0
  const yearsTo60 = 60 - age
  const projectedAt60 =
    balance > 0 && rate > 0 && age > 0 && yearsTo60 > 0
      ? balance * Math.pow(1 + rate / 100, yearsTo60)
      : null

  function handleCategoryChange(cat: AssetClass) {
    setForm((p) => ({
      ...p,
      category: cat,
      expectedReturn: p.expectedReturn || DEFAULT_RATES[cat] || '',
    }))
  }

  function handleAdd() {
    if (!form.balance) return
    const cv = parseFloat(form.balance) || 0
    onAdd({
      name: form.name || currentCat.label,
      assetClass: form.category,
      currentValue: cv,
      investedValue: cv,
      expectedReturn: rate || undefined,
      currentAge: age || undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Retirement Accounts</h3>
          <p className="text-sm text-theme-muted">NPS, EPF, PPF, Annuity — India's pension ecosystem</p>
        </div>
      </div>

      {entries.map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div className="flex items-center gap-2">
            <AssetClassBadge assetClass={e.assetClass} />
            <div>
              <p className="text-sm font-medium text-theme-text">{e.name}</p>
              <p className="text-xs text-theme-muted">
                {formatRupeesCompact(e.currentValue)}
                {e.expectedReturn ? ` · ${e.expectedReturn}% p.a.` : ''}
                {e.currentAge ? ` · age ${e.currentAge}` : ''}
              </p>
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
            <label className="block text-xs font-medium text-theme-text mb-1">Account Type</label>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value as AssetClass)}
              className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-theme-text mb-1">Name <span className="text-theme-muted">(optional)</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={currentCat.placeholder}
              className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <MoneyInput
            label="Current Balance"
            value={form.balance}
            onChange={(v) => setForm((p) => ({ ...p, balance: v }))}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Rate of Return % <span className="text-theme-muted">(p.a.)</span></label>
              <input
                type="number" min={0} max={20} step={0.25}
                value={form.expectedReturn}
                onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))}
                placeholder={DEFAULT_RATES[form.category] || '8'}
                className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Your Current Age</label>
              <input
                type="number" min={18} max={59} step={1}
                value={form.currentAge}
                onChange={(e) => setForm((p) => ({ ...p, currentAge: e.target.value }))}
                placeholder="30"
                className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {projectedAt60 !== null && (
            <div className="px-3 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-theme-muted mb-0.5">Projected value at age 60 · {yearsTo60}y @ {rate}% p.a.</p>
              <p className="text-base font-semibold text-purple-700">{formatRupeesCompact(projectedAt60)}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!form.balance}
              className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShow(false); setForm(EMPTY) }}
              className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full"
        >
          <Plus size={15} /> Add retirement account
        </button>
      )}
    </div>
  )
}
