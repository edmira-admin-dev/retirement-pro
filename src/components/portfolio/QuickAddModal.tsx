import { useState } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAddHolding } from '../../hooks/useHoldings'
import { usePortfolioUIStore } from '../../stores/portfolioUIStore'
import { StepBank } from './wizard/steps/StepBank'
import { StepLiquid } from './wizard/steps/StepLiquid'
import { StepFixedIncome } from './wizard/steps/StepFixedIncome'
import { StepEquity } from './wizard/steps/StepEquity'
import { StepGold } from './wizard/steps/StepGold'
import { StepRealEstate } from './wizard/steps/StepRealEstate'
import { StepRetirement } from './wizard/steps/StepRetirement'
import { StepInternational } from './wizard/steps/StepInternational'
import { StepCommodities } from './wizard/steps/StepCommodities'
import type { WizardEntry } from './wizard/wizardTypes'
import type { HoldingInput } from '../../types/holdings'

const TITLES: Record<string, string> = {
  cash: 'Cash & Savings', fixed: 'Fixed Income', equity: 'Equity',
  retirement: 'Retirement', real: 'Real Estate', bullions: 'Bullions',
  global: 'Global', commodities: 'Commodities',
}

function buildNotes(e: Omit<WizardEntry, 'localId' | 'stepKey'>): string | undefined {
  const d: Record<string, unknown> = {}
  if (e.expectedReturn !== undefined) d.r = e.expectedReturn
  if (e.currency) d.cur = e.currency
  if (e.loanAmount) d.loan = e.loanAmount
  if (e.startDate) d.startDate = e.startDate
  if (e.termMonths) d.termMonths = e.termMonths
  if (e.payoutFrequency) d.payoutFreq = e.payoutFrequency
  if (e.currentAge !== undefined) {
    d.age = e.currentAge
    d.yr = new Date().getFullYear()
  }
  return Object.keys(d).length ? JSON.stringify(d) : undefined
}

interface QuickAddModalProps {
  groupId: string
  onClose: () => void
}

function QuickAddModalInner({ groupId, onClose }: QuickAddModalProps) {
  const { mutateAsync: addHolding } = useAddHolding()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cashSub, setCashSub] = useState<'bank' | 'liquid'>('bank')

  async function handleAdd(e: Omit<WizardEntry, 'localId' | 'stepKey'>) {
    setSaving(true)
    setError(null)
    try {
      const input: HoldingInput = {
        name: e.name, assetClass: e.assetClass,
        currentValue: e.currentValue, investedValue: e.investedValue,
        notes: buildNotes(e),
      }
      await addHolding(input)
      await queryClient.refetchQueries({ queryKey: ['holdings'] })
      setSavedCount((n) => n + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const noop = () => {}
  const EMPTY_ENTRIES: WizardEntry[] = []

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      {saving && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-xs font-medium">
          <Loader2 size={13} className="animate-spin" /> Saving…
        </div>
      )}
      {savedCount > 0 && !saving && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-medium">
          <CheckCircle size={13} /> {savedCount} holding{savedCount !== 1 ? 's' : ''} saved — add more or close
        </div>
      )}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
          {error}
        </div>
      )}

      {/* Sub-selector for cash */}
      {groupId === 'cash' && (
        <>
          <div className="flex gap-1 p-1 rounded-lg bg-theme-bg-alt border border-theme-border mb-1">
            {(['bank', 'liquid'] as const).map((id) => (
              <button key={id} onClick={() => setCashSub(id)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  cashSub === id ? 'bg-theme-card shadow text-theme-text' : 'text-theme-muted hover:text-theme-text'
                }`}>
                {id === 'bank' ? 'Bank Account' : 'Liquid Fund'}
              </button>
            ))}
          </div>
          {cashSub === 'bank'
            ? <StepBank   key="bank"   entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />
            : <StepLiquid key="liquid" entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
        </>
      )}

      {/* Step content */}
      {groupId === 'fixed'   && <StepFixedIncome entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'equity'  && <StepEquity     entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'retirement' && <StepRetirement entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'global'      && <StepInternational entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'commodities' && <StepCommodities   entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'bullions'    && <StepGold          entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}
      {groupId === 'real'        && <StepRealEstate    entries={EMPTY_ENTRIES} onAdd={handleAdd} onRemove={noop} initialOpen />}

      <div className="flex justify-end pt-2 border-t border-theme-border mt-1">
        <button onClick={onClose} className="px-5 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary">
          Done
        </button>
      </div>
    </div>
  )
}

export function QuickAddModal() {
  const { quickAddGroup, closeQuickAdd } = usePortfolioUIStore()
  if (!quickAddGroup) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeQuickAdd} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={`Add ${TITLES[quickAddGroup] ?? quickAddGroup}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-theme-card border border-theme-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border shrink-0">
            <div>
              <h2 className="text-base font-semibold text-theme-text">Add {TITLES[quickAddGroup] ?? quickAddGroup}</h2>
              <p className="text-xs text-theme-muted">Fill the form and click Add — saves immediately</p>
            </div>
            <button onClick={closeQuickAdd} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <QuickAddModalInner groupId={quickAddGroup} onClose={closeQuickAdd} />
          </div>
        </div>
      </div>
    </>
  )
}
