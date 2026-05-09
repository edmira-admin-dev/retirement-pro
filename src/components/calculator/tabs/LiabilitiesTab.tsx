import { Plus, Trash2 } from 'lucide-react'
import { SliderInput } from '../SliderInput'
import { RupeeField } from '../RupeeField'
import { formatRupeesCompact } from '../../../utils/money'
import type { LiabilityItem } from '../../../types/fire'

const BLANK: LiabilityItem = {
  label: 'Home Loan',
  emiMonthly: 0,
  interestRate: 8.5,
  remainingMonths: 120,
  outstandingPrincipal: 0,
}

interface LiabilitiesTabProps {
  liabilities: LiabilityItem[] | null
  onChange: (liabilities: LiabilityItem[] | null) => void
  onBlur: () => void
}

export const LiabilitiesTab = ({ liabilities, onChange, onBlur }: LiabilitiesTabProps) => {
  const items = liabilities ?? []
  const enabled = liabilities !== null

  const totalEmi = items.reduce((s, l) => s + l.emiMonthly, 0)
  const debtFreeMonths = items.length > 0 ? Math.max(...items.map((l) => l.remainingMonths)) : 0
  const debtFreeYears = Math.ceil(debtFreeMonths / 12)

  const update = (i: number, patch: Partial<LiabilityItem>) =>
    onChange(items.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-theme-muted uppercase tracking-wider">Liabilities & EMIs</p>
        <button
          onClick={() => onChange(enabled ? null : [{ ...BLANK }])}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${enabled ? 'bg-theme-primary text-white' : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'}`}
        >
          {enabled ? 'Enabled' : 'Off'}
        </button>
      </div>

      {!enabled && (
        <p className="text-xs text-theme-muted">Enable to model EMIs and their impact on investable surplus.</p>
      )}

      {enabled && (
        <>
          {items.length > 0 && (
            <div className="bg-theme-bg-alt rounded-lg p-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-theme-muted">Total EMI / mo</p>
                <p className="text-sm font-semibold text-theme-text">{formatRupeesCompact(totalEmi)}</p>
              </div>
              <div>
                <p className="text-xs text-theme-muted">Debt-free in</p>
                <p className="text-sm font-semibold text-theme-text">{debtFreeYears} yrs</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="border border-theme-border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <input
                    value={item.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    onBlur={onBlur}
                    className="text-sm font-medium text-theme-text bg-transparent border-b border-transparent hover:border-theme-border focus:border-theme-primary focus:outline-none w-full mr-2"
                  />
                  <button
                    onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                    className="text-theme-muted hover:text-red-500 transition-colors shrink-0"
                    aria-label="Remove liability"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <RupeeField label="EMI / month" value={item.emiMonthly} onChange={(v) => update(i, { emiMonthly: v })} onBlur={onBlur} />
                <div className="grid grid-cols-2 gap-2">
                  <SliderInput label="Interest %" value={item.interestRate} min={4} max={24} step={0.25} unit="%" onChange={(v) => update(i, { interestRate: v })} onBlur={onBlur} />
                  <SliderInput label="Months left" value={item.remainingMonths} min={1} max={360} unit="mo" onChange={(v) => update(i, { remainingMonths: v })} onBlur={onBlur} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onChange([...items, { ...BLANK, label: 'Loan' }])}
            className="flex items-center gap-2 text-sm text-theme-primary hover:opacity-80 transition-opacity"
          >
            <Plus size={14} /> Add liability
          </button>
        </>
      )}
    </div>
  )
}
