import { useState } from 'react'
import { Plus, Trash2, ScrollText } from 'lucide-react'
import type { WizardEntry, PayoutFrequency } from '../wizardTypes'
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

const CATEGORIES: { label: string; value: AssetClass }[] = [
  { label: 'Fixed Deposit (FD)', value: 'FD' },
  { label: 'Debt Mutual Fund', value: 'MF' },
  { label: 'Corporate / Govt Bond', value: 'BOND' },
]

const EMPTY = {
  name: '',
  category: 'FD' as AssetClass,
  invested: '',
  value: '',
  expectedReturn: '',
  startDate: '',
  durationYears: '',
  durationMonths: '',
  payoutFrequency: 'maturity' as PayoutFrequency,
}

/** Compound-quarterly accrual to last-month-end for at-maturity instruments. */
function calcAccruedValue(principal: number, annualRate: number, startMmYy: string, payout: PayoutFrequency): number {
  const [rawMm, rawYy] = startMmYy.split('/')
  const mm = parseInt(rawMm, 10)
  const yy = parseInt(rawYy, 10)
  if (!mm || !yy || mm < 1 || mm > 12) return principal
  const start = new Date(2000 + yy, mm - 1, 1)
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  const elapsedMs = lastMonthEnd.getTime() - start.getTime()
  if (elapsedMs <= 0) return principal
  if (payout !== 'maturity') return principal // interest paid out; principal unchanged
  const quarters = (elapsedMs / (365.25 * 24 * 3600 * 1000)) * 4
  return principal * Math.pow(1 + annualRate / 400, quarters)
}

export function StepFixedIncome({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  const isTermInstrument = form.category === 'FD' || form.category === 'BOND'
  const principal = parseFloat(form.invested) || 0
  const rate = parseFloat(form.expectedReturn) || 0
  const previewValue = isTermInstrument && form.startDate && rate > 0
    ? calcAccruedValue(principal, rate, form.startDate, form.payoutFrequency)
    : null

  function handleAdd() {
    if (!form.name || !form.invested) return
    const currentValue = isTermInstrument
      ? (previewValue ?? principal)
      : (form.value ? parseFloat(form.value) : principal)
    const termMonths = isTermInstrument
      ? (parseInt(form.durationYears || '0') * 12 + parseInt(form.durationMonths || '0')) || undefined
      : undefined
    onAdd({
      name: form.name,
      assetClass: form.category,
      currentValue,
      investedValue: principal,
      expectedReturn: rate || undefined,
      startDate: isTermInstrument && form.startDate ? form.startDate : undefined,
      termMonths,
      payoutFrequency: isTermInstrument ? form.payoutFrequency : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <ScrollText size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Fixed Income</h3>
          <p className="text-sm text-theme-muted">FDs, bonds, debt MFs — stable return instruments</p>
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
                {e.expectedReturn ? ` · ${e.expectedReturn}%` : ''}
                {e.startDate ? ` · from ${e.startDate}` : ''}
                {e.payoutFrequency && e.payoutFrequency !== 'maturity' ? ` · ${e.payoutFrequency}` : ''}
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Category</label>
              <select value={form.category} onChange={(e) => {
                const cat = e.target.value as AssetClass
                const isTerm = cat === 'FD' || cat === 'BOND'
                setForm((p) => ({ ...p, category: cat, value: isTerm ? '' : p.value }))
              }} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Name / Issuer</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={form.category === 'FD' ? 'SBI FD – 2026' : form.category === 'BOND' ? 'HDFC Bond 7.5%' : 'HDFC Short Term Fund'} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MoneyInput label="Principal / Invested" value={form.invested} onChange={(v) => setForm((p) => ({ ...p, invested: v }))} />
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">
                {form.category === 'BOND' ? 'Coupon Rate %' : 'Interest Rate %'} <span className="text-theme-muted">(opt)</span>
              </label>
              <input type="number" min={0} max={30} step={0.25} value={form.expectedReturn} onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))} placeholder="7.5" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>

          {isTermInstrument && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-theme-text mb-1">Started (MM/YY)</label>
                  <input value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} placeholder="03/22" maxLength={5} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-theme-text mb-1">Interest Payout</label>
                  <select value={form.payoutFrequency} onChange={(e) => setForm((p) => ({ ...p, payoutFrequency: e.target.value as PayoutFrequency }))} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer">
                    <option value="maturity">At Maturity</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-theme-text mb-1">Duration — Years <span className="text-theme-muted">(opt)</span></label>
                  <input type="number" min={0} max={30} step={1} value={form.durationYears} onChange={(e) => setForm((p) => ({ ...p, durationYears: e.target.value }))} placeholder="3" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-theme-text mb-1">Duration — Months <span className="text-theme-muted">(opt)</span></label>
                  <input type="number" min={0} max={11} step={1} value={form.durationMonths} onChange={(e) => setForm((p) => ({ ...p, durationMonths: e.target.value }))} placeholder="6" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
                </div>
              </div>
              {previewValue != null && (
                <div className="px-3 py-2 rounded-lg bg-theme-primary/10 border border-theme-primary/20">
                  <p className="text-xs text-theme-muted">Estimated value accrued to last month-end</p>
                  <p className="text-sm font-semibold text-theme-primary">{formatRupeesCompact(previewValue)}</p>
                </div>
              )}
            </>
          )}

          {!isTermInstrument && (
            <MoneyInput label="Current Value" value={form.value} onChange={(v) => setForm((p) => ({ ...p, value: v }))} />
          )}

          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || !form.invested} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add fixed income instrument
        </button>
      )}
    </div>
  )
}
