import { Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import type { WizardEntry } from '../wizardTypes'
import { AssetClassBadge } from '../../AssetClassBadge'
import { formatRupeesCompact } from '../../../../utils/money'
import type { AssetClass } from '../../../../types/holdings'

interface Props {
  entries: WizardEntry[]
  onRemove: (id: string) => void
  submitting: boolean
  error: string | null
}

const STEP_LABELS: Record<string, string> = {
  bank: 'Bank & Cash',
  liquid: 'Liquid Funds',
  fixed: 'Fixed Income',
  equity: 'Equity',
  gold: 'Gold & Silver',
  realestate: 'Real Estate',
  retirement: 'Retirement Accounts',
  intl: 'International',
  commodities: 'Commodities',
}

const LABELS: Record<AssetClass, string> = {
  MF: 'Mutual Funds', NPS: 'NPS', EPF: 'EPF', PPF: 'PPF', STOCK: 'Stocks',
  BANK: 'Bank', LIQUID: 'Liquid', FD: 'FD', BOND: 'Bond', ETF: 'ETF',
  GOLD: 'Gold', REAL_ESTATE: 'Real Estate', ANNUITY: 'Annuity',
  INTL_EQUITY: 'Intl Equity', INTL_DEBT: 'Intl Debt', COMMODITY: 'Commodities',
}

export function StepReview({ entries, onRemove, submitting, error }: Props) {
  const totalValue = entries.reduce((s, e) => s + e.currentValue, 0)

  const grouped = entries.reduce<Record<string, WizardEntry[]>>((acc, e) => {
    const key = e.stepKey
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <AlertCircle size={32} className="text-warning opacity-60" />
        <p className="text-sm font-medium text-theme-text">No entries added yet</p>
        <p className="text-xs text-theme-muted">Go back and add at least one asset to build your portfolio</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-theme-primary/15 flex items-center justify-center shrink-0">
          <CheckCircle size={20} className="text-theme-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-theme-text">Review Your Portfolio</h3>
          <p className="text-sm text-theme-muted">{entries.length} holding{entries.length !== 1 ? 's' : ''} · Total {formatRupeesCompact(totalValue)}</p>
        </div>
      </div>

      {Object.keys(grouped).map((stepKey) => (
        <div key={stepKey}>
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-2">{STEP_LABELS[stepKey] ?? stepKey}</p>
          <div className="space-y-2">
            {grouped[stepKey].map((e) => (
              <div key={e.localId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-theme-bg-alt border border-theme-border">
                <div className="flex items-center gap-2 min-w-0">
                  <AssetClassBadge assetClass={e.assetClass} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-theme-text truncate">{e.name}</p>
                    <p className="text-xs text-theme-muted">
                      {formatRupeesCompact(e.currentValue)}
                      {e.investedValue !== e.currentValue ? ` · Invested ${formatRupeesCompact(e.investedValue)}` : ''}
                      {e.expectedReturn ? ` · ${e.expectedReturn}% p.a.` : ''}
                      {e.currency ? ` · ${e.currency}` : ''}
                    </p>
                  </div>
                </div>
                {!submitting && (
                  <button onClick={() => onRemove(e.localId)} className="p-1.5 text-theme-muted hover:text-danger cursor-pointer transition-colors shrink-0 ml-2" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-3 border-t border-theme-border">
        <span className="text-sm font-semibold text-theme-text">Total Net Worth</span>
        <span className="text-lg font-bold text-theme-primary font-mono">{formatRupeesCompact(totalValue)}</span>
      </div>

      {submitting && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-sm">
          <Loader2 size={15} className="animate-spin" />
          Saving holdings… ({entries.length} remaining)
        </div>
      )}

      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-theme-muted">
        {LABELS.MF} — You can edit or add more holdings any time after completing setup.
      </p>
    </div>
  )
}
