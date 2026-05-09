import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
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

type SubTab = 'STOCK' | 'ETF' | 'MF'
const SUB_TABS: { id: SubTab; label: string; placeholder: string }[] = [
  { id: 'STOCK', label: 'Direct Stocks', placeholder: 'e.g. Zerodha Portfolio' },
  { id: 'ETF',   label: 'ETFs',          placeholder: 'e.g. Nifty 50 ETF (NIFTYBEES)' },
  { id: 'MF',    label: 'Mutual Funds',  placeholder: 'e.g. Axis Bluechip Fund' },
]

const EMPTY = { name: '', value: '', invested: '', expectedReturn: '' }

export function StepEquity({ entries, onAdd, onRemove, initialOpen }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('STOCK')
  const [show, setShow] = useState(initialOpen ?? false)
  const [form, setForm] = useState(EMPTY)

  const currentTab = SUB_TABS.find((t) => t.id === subTab)!

  function handleAdd() {
    if (!form.name || !form.value) return
    const cv = parseFloat(form.value) || 0
    onAdd({
      name: form.name,
      assetClass: subTab as AssetClass,
      currentValue: cv,
      investedValue: form.invested ? parseFloat(form.invested) : cv,
      expectedReturn: form.expectedReturn ? parseFloat(form.expectedReturn) : undefined,
    })
    setForm(EMPTY)
    setShow(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-theme-primary/15 flex items-center justify-center shrink-0">
          <TrendingUp size={20} className="text-theme-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Equity Investments</h3>
          <p className="text-sm text-theme-muted">Stocks, ETFs and equity mutual funds</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-theme-bg-alt border border-theme-border">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSubTab(t.id); setShow(false); setForm(EMPTY) }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              subTab === t.id ? 'bg-theme-card shadow text-theme-text' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entries.filter((e) => e.assetClass === subTab).map((e) => (
        <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
          <div className="flex items-center gap-2">
            <AssetClassBadge assetClass={e.assetClass} />
            <div>
              <p className="text-sm font-medium text-theme-text">{e.name}</p>
              <p className="text-xs text-theme-muted">{formatRupeesCompact(e.currentValue)}{e.expectedReturn ? ` · ${e.expectedReturn}%` : ''}</p>
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
              <label className="block text-xs font-medium text-theme-text mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={currentTab.placeholder} className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
            <MoneyInput
              label="Current Value"
              value={form.value}
              onChange={(v) => setForm((p) => ({ ...p, value: v }))}
            />
            <MoneyInput
              label="Invested"
              optional
              value={form.invested}
              onChange={(v) => setForm((p) => ({ ...p, invested: v }))}
              placeholder="same as value"
            />
            <div>
              <label className="block text-xs font-medium text-theme-text mb-1">Expected Return % <span className="text-theme-muted">(opt)</span></label>
              <input type="number" min={0} max={50} step={0.5} value={form.expectedReturn} onChange={(e) => setForm((p) => ({ ...p, expectedReturn: e.target.value }))} placeholder="12" className="w-full px-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || !form.value} className="px-4 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors">Add</button>
            <button onClick={() => { setShow(false); setForm(EMPTY) }} className="px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text text-sm cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary text-sm cursor-pointer transition-colors w-full">
          <Plus size={15} /> Add {currentTab.label.toLowerCase()}
        </button>
      )}
    </div>
  )
}
