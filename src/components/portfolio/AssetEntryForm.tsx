import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAddHolding, useUpdateHolding, useHoldings } from '../../hooks/useHoldings'
import { usePortfolioUIStore } from '../../stores/portfolioUIStore'
import type { AssetClass, HoldingInput } from '../../types/holdings'
import { MoneyInput } from '../ui/MoneyInput'

const FIXED_INCOME_CLASSES: AssetClass[] = ['FD', 'BOND']

const DEFAULT_RATES: Partial<Record<AssetClass, string>> = {
  BANK: '4', LIQUID: '6',
  MF: '12', STOCK: '15', ETF: '12',
  NPS: '10', EPF: '8.25', PPF: '7.1', ANNUITY: '6',
  GOLD: '8', REAL_ESTATE: '7',
  INTL_EQUITY: '10', INTL_DEBT: '6',
  COMMODITY: '9',
}

function parseRateFromNotes(notes?: string): string {
  if (!notes) return ''
  try {
    const p = JSON.parse(notes)
    return typeof p?.r === 'number' ? String(p.r) : ''
  } catch {
    return ''
  }
}

function packRateNotes(rate: string, existingNotes?: string): string | undefined {
  let existing: Record<string, unknown> = {}
  try {
    if (existingNotes) existing = JSON.parse(existingNotes) ?? {}
  } catch { /* ignore */ }
  const r = parseFloat(rate)
  const merged = { ...existing, ...(isNaN(r) ? {} : { r }) }
  return Object.keys(merged).length ? JSON.stringify(merged) : undefined
}

const ASSET_CLASSES: { value: AssetClass; label: string; group: string }[] = [
  { value: 'BANK',        label: 'Bank / Savings Account',  group: 'Cash & Savings' },
  { value: 'LIQUID',      label: 'Liquid Fund',             group: 'Cash & Savings' },
  { value: 'FD',          label: 'Fixed Deposit (FD)',      group: 'Fixed Income' },
  { value: 'BOND',        label: 'Corporate / Govt Bond',   group: 'Fixed Income' },
  { value: 'MF',          label: 'Mutual Fund (MF)',        group: 'Equity' },
  { value: 'STOCK',       label: 'Stocks',                  group: 'Equity' },
  { value: 'ETF',         label: 'ETF',                     group: 'Equity' },
  { value: 'NPS',         label: 'NPS',                     group: 'Retirement' },
  { value: 'EPF',         label: 'EPF / VPF',               group: 'Retirement' },
  { value: 'PPF',         label: 'PPF',                     group: 'Retirement' },
  { value: 'ANNUITY',     label: 'Annuity',                 group: 'Retirement' },
  { value: 'GOLD',        label: 'Gold / Silver',           group: 'Real Assets' },
  { value: 'REAL_ESTATE', label: 'Real Estate',             group: 'Real Assets' },
  { value: 'INTL_EQUITY', label: 'International Equity',    group: 'Global' },
  { value: 'INTL_DEBT',   label: 'International Debt',      group: 'Global' },
  { value: 'COMMODITY',   label: 'Commodity (Oil, Agri, Metals)', group: 'Commodities' },
]

const EMPTY: HoldingInput = {
  name: '',
  assetClass: 'MF',
  currentValue: 0,
  investedValue: 0,
}

export function AssetEntryForm() {
  const { drawerOpen, editingId, closeDrawer } = usePortfolioUIStore()
  const { data: holdings } = useHoldings()

  const addMutation = useAddHolding()
  const updateMutation = useUpdateHolding()

  const [form, setForm] = useState<HoldingInput>(EMPTY)
  const [rateOfReturn, setRateOfReturn] = useState('')
  const [error, setError] = useState('')

  const editing = editingId ? holdings?.find((h) => h.id === editingId) : null
  const isPending = addMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        assetClass: editing.assetClass,
        currentValue: editing.currentValue,
        investedValue: editing.investedValue,
        units: editing.units,
        nav: editing.nav,
        notes: editing.notes,
      })
      setRateOfReturn(parseRateFromNotes(editing.notes))
    } else {
      setForm(EMPTY)
      setRateOfReturn('')
    }
    setError('')
  }, [editingId, drawerOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeDrawer])

  function set<K extends keyof HoldingInput>(key: K, value: HoldingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const isSimple = !FIXED_INCOME_CLASSES.includes(form.assetClass)
      const payload: HoldingInput = isSimple
        ? {
            ...form,
            investedValue: form.currentValue,
            notes: packRateNotes(rateOfReturn, editing?.notes),
          }
        : form
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, input: payload })
      } else {
        await addMutation.mutateAsync(payload)
      }
      closeDrawer()
    } catch {
      setError('Failed to save. Please try again.')
    }
  }

  const isSimpleForm = !FIXED_INCOME_CLASSES.includes(form.assetClass)

  if (!drawerOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-theme-card border-l border-theme-border flex flex-col shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={editingId ? 'Edit holding' : 'Add holding'}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border">
          <h2 className="text-base font-semibold text-theme-text">
            {editingId ? 'Edit Holding' : 'Add Holding'}
          </h2>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <form id="asset-entry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="ac-name" className="block text-sm font-medium text-theme-text mb-1.5">
              Name
            </label>
            <input
              id="ac-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Axis Bluechip Fund"
              className="w-full px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border text-theme-text placeholder:text-theme-muted text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="ac-class" className="block text-sm font-medium text-theme-text mb-1.5">
              Asset class
            </label>
            <select
              id="ac-class"
              value={form.assetClass}
              onChange={(e) => {
                const ac = e.target.value as AssetClass
                set('assetClass', ac)
                // seed rate placeholder when switching to a simple-form class
                if (!FIXED_INCOME_CLASSES.includes(ac) && !rateOfReturn) {
                  setRateOfReturn(DEFAULT_RATES[ac] ?? '')
                }
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors cursor-pointer"
            >
              {Array.from(new Set(ASSET_CLASSES.map((ac) => ac.group))).map((group) => (
                <optgroup key={group} label={group}>
                  {ASSET_CLASSES.filter((ac) => ac.group === group).map((ac) => (
                    <option key={ac.value} value={ac.value}>{ac.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {isSimpleForm ? (
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput
                id="ac-current"
                label="Current Balance"
                required
                value={String(form.currentValue || '')}
                onChange={(v) => set('currentValue', parseFloat(v) || 0)}
              />
              <div>
                <label htmlFor="ac-rate" className="block text-xs font-medium text-theme-text mb-1">
                  Annual Return %
                </label>
                <input
                  id="ac-rate"
                  type="number"
                  min={0}
                  max={50}
                  step={0.25}
                  value={rateOfReturn}
                  onChange={(e) => setRateOfReturn(e.target.value)}
                  placeholder={DEFAULT_RATES[form.assetClass] ?? '8'}
                  className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary transition-colors"
                />
                <p className="min-h-[16px] mt-1" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <MoneyInput
                  id="ac-current"
                  label="Current Value"
                  required
                  value={String(form.currentValue || '')}
                  onChange={(v) => set('currentValue', parseFloat(v) || 0)}
                />
                <MoneyInput
                  id="ac-invested"
                  label="Invested"
                  required
                  value={String(form.investedValue || '')}
                  onChange={(v) => set('investedValue', parseFloat(v) || 0)}
                />
              </div>

              <div>
                <label htmlFor="ac-notes" className="block text-sm font-medium text-theme-text mb-1.5">
                  Notes <span className="text-theme-muted">(opt)</span>
                </label>
                <textarea
                  id="ac-notes"
                  rows={3}
                  value={form.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value || undefined)}
                  className="w-full px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border text-theme-text placeholder:text-theme-muted text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors resize-none"
                  placeholder="Optional notes…"
                />
              </div>
            </>
          )}
        </form>

        <div className="px-5 py-4 border-t border-theme-border">
          <button
            type="submit"
            form="asset-entry-form"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Add holding'}
          </button>
        </div>
      </aside>
    </>
  )
}
