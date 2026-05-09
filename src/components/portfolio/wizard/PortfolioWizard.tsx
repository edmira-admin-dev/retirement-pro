import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAddHolding } from '../../../hooks/useHoldings'
import { usePortfolioUIStore } from '../../../stores/portfolioUIStore'
import { WizardProgress } from './WizardProgress'
import { StepBank } from './steps/StepBank'
import { StepLiquid } from './steps/StepLiquid'
import { StepFixedIncome } from './steps/StepFixedIncome'
import { StepEquity } from './steps/StepEquity'
import { StepGold } from './steps/StepGold'
import { StepRealEstate } from './steps/StepRealEstate'
import { StepRetirement } from './steps/StepRetirement'
import { StepInternational } from './steps/StepInternational'
import { StepCommodities } from './steps/StepCommodities'
import { StepReview } from './steps/StepReview'
import type { WizardEntry, WizardStepKey } from './wizardTypes'
import { makeId } from './wizardTypes'
import type { HoldingInput } from '../../../types/holdings'

const DATA_STEPS: { key: WizardStepKey; label: string }[] = [
  { key: 'bank',       label: 'Bank' },
  { key: 'liquid',     label: 'Liquid' },
  { key: 'fixed',      label: 'Fixed' },
  { key: 'equity',     label: 'Equity' },
  { key: 'gold',       label: 'Gold' },
  { key: 'realestate', label: 'Property' },
  { key: 'retirement', label: 'Pension' },
  { key: 'intl',       label: 'Global' },
  { key: 'commodities', label: 'Commodity' },
  { key: 'review',     label: 'Review' },
]

const STEP_LABELS = DATA_STEPS.map((s) => s.label)

export function PortfolioWizard() {
  const { wizardOpen, closeWizard } = usePortfolioUIStore()
  const addHolding = useAddHolding()
  const queryClient = useQueryClient()

  const [stepIndex, setStepIndex] = useState(0)
  const [entries, setEntries] = useState<WizardEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Reset on open
  useEffect(() => {
    if (wizardOpen) {
      setStepIndex(0)
      setEntries([])
      setSubmitting(false)
      setSubmitError(null)
      setSavedCount(0)
      setSaveSuccess(null)
    }
  }, [wizardOpen])

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) closeWizard() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeWizard, submitting])

  if (!wizardOpen) return null

  const currentKey = DATA_STEPS[stepIndex].key
  const isLastStep = stepIndex === DATA_STEPS.length - 1
  const isFirstStep = stepIndex === 0

  function addEntry(stepKey: string, e: Omit<WizardEntry, 'localId' | 'stepKey'>) {
    setEntries((prev) => [...prev, { ...e, localId: makeId(), stepKey }])
  }

  function removeEntry(localId: string) {
    setEntries((prev) => prev.filter((e) => e.localId !== localId))
  }

  function stepEntries(key: string) {
    return entries.filter((e) => e.stepKey === key)
  }

  function serializeEntry(entry: WizardEntry): HoldingInput {
    const notesData: Record<string, unknown> = {}
    if (entry.expectedReturn !== undefined) notesData.r = entry.expectedReturn
    if (entry.currency) notesData.cur = entry.currency
    if (entry.loanAmount) notesData.loan = entry.loanAmount
    if (entry.startDate) notesData.startDate = entry.startDate
    if (entry.termMonths) notesData.termMonths = entry.termMonths
    if (entry.payoutFrequency) notesData.payoutFreq = entry.payoutFrequency
    if (entry.currentAge !== undefined) {
      notesData.age = entry.currentAge
      notesData.yr = new Date().getFullYear()
    }
    return {
      name: entry.name,
      assetClass: entry.assetClass,
      currentValue: entry.currentValue,
      investedValue: entry.investedValue,
      notes: Object.keys(notesData).length ? JSON.stringify(notesData) : undefined,
    }
  }

  async function saveEntries(toSave: WizardEntry[]) {
    for (const entry of toSave) {
      await addHolding.mutateAsync(serializeEntry(entry))
    }
    await queryClient.refetchQueries({ queryKey: ['holdings'] })
  }

  async function handleSaveAndContinue() {
    if (entries.length === 0) return
    const toSave = entries
    setSubmitting(true)
    setSubmitError(null)
    setSaveSuccess(null)
    try {
      await saveEntries(toSave)
      setSavedCount((c) => c + toSave.length)
      setEntries([])
      setSaveSuccess(`${toSave.length} holding${toSave.length !== 1 ? 's' : ''} saved — keep adding more or close anytime.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save holdings.'
      setSubmitError(`${msg} — Check your connection and try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit() {
    if (entries.length === 0 && savedCount === 0) {
      setSubmitError('Add at least one holding before saving your portfolio.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (entries.length > 0) await saveEntries(entries)
      closeWizard()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save holdings.'
      setSubmitError(`${msg} — Check your connection and try again.`)
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={!submitting ? closeWizard : undefined} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio setup wizard"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl bg-theme-card border border-theme-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-theme-text">Build Your Portfolio</h2>
                {savedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-xs font-semibold">
                    {savedCount} saved
                  </span>
                )}
                {entries.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-theme-primary/15 text-theme-primary text-xs font-semibold">
                    {entries.length} pending
                  </span>
                )}
              </div>
              <p className="text-xs text-theme-muted">Step {stepIndex + 1} of {DATA_STEPS.length} — fill form then click Add in each step</p>
            </div>
            {!submitting && (
              <button onClick={closeWizard} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary" aria-label="Close wizard">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="px-5 py-3 border-b border-theme-border shrink-0">
            <WizardProgress steps={STEP_LABELS} currentIndex={stepIndex} />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {currentKey === 'bank'       && <StepBank       entries={stepEntries('bank')}       onAdd={(e) => addEntry('bank', e)}       onRemove={removeEntry} />}
            {currentKey === 'liquid'     && <StepLiquid     entries={stepEntries('liquid')}     onAdd={(e) => addEntry('liquid', e)}     onRemove={removeEntry} />}
            {currentKey === 'fixed'      && <StepFixedIncome entries={stepEntries('fixed')}      onAdd={(e) => addEntry('fixed', e)}      onRemove={removeEntry} />}
            {currentKey === 'equity'     && <StepEquity     entries={stepEntries('equity')}     onAdd={(e) => addEntry('equity', e)}     onRemove={removeEntry} />}
            {currentKey === 'gold'       && <StepGold       entries={stepEntries('gold')}       onAdd={(e) => addEntry('gold', e)}       onRemove={removeEntry} />}
            {currentKey === 'realestate' && <StepRealEstate  entries={stepEntries('realestate')} onAdd={(e) => addEntry('realestate', e)} onRemove={removeEntry} />}
            {currentKey === 'retirement' && <StepRetirement  entries={stepEntries('retirement')} onAdd={(e) => addEntry('retirement', e)} onRemove={removeEntry} />}
            {currentKey === 'intl'       && <StepInternational entries={stepEntries('intl')}          onAdd={(e) => addEntry('intl', e)}         onRemove={removeEntry} />}
            {currentKey === 'commodities' && <StepCommodities  entries={stepEntries('commodities')}  onAdd={(e) => addEntry('commodities', e)}  onRemove={removeEntry} />}
            {currentKey === 'review'     && <StepReview     entries={entries}                        onRemove={removeEntry}                     submitting={submitting} error={submitError} />}
          </div>

          {/* Success banner */}
          {saveSuccess && !submitting && !submitError && (
            <div className="mx-5 mb-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-medium shrink-0">
              {saveSuccess}
            </div>
          )}

          {/* Inline error banner — visible on any step */}
          {submitError && !submitting && (
            <div className="mx-5 mb-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium shrink-0">
              {submitError}
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-theme-border shrink-0">
            <button
              onClick={() => setStepIndex((i) => i - 1)}
              disabled={isFirstStep || submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-theme-border text-theme-muted hover:text-theme-text disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>

            <div className="flex items-center gap-2">
              {!isLastStep && (
                <button
                  onClick={() => setStepIndex((i) => i + 1)}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-theme-muted hover:text-theme-text disabled:opacity-30 text-sm cursor-pointer transition-colors"
                >
                  <SkipForward size={14} /> Skip
                </button>
              )}
              {!isLastStep && entries.length > 0 && (
                <button
                  onClick={handleSaveAndContinue}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-theme-primary text-theme-primary hover:bg-theme-primary/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium cursor-pointer transition-colors"
                >
                  {submitting ? 'Saving…' : `Save & Continue (${entries.length})`}
                </button>
              )}
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  {submitting ? 'Saving…' : (entries.length > 0 || savedCount > 0) ? `Save Portfolio${entries.length > 0 ? ` (${entries.length})` : ''}` : 'Build Portfolio'}
                </button>
              ) : (
                <button
                  onClick={() => setStepIndex((i) => i + 1)}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  Next <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
