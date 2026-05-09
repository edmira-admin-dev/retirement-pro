import { useRef } from 'react'
import { Lock } from 'lucide-react'
import { useSaveHealthProfile } from '../../hooks/useHealthProfile'
import { formatRupeesCompact, rupeesToWords } from '../../utils/money'
import type { HealthInputs } from '../../types/health'

interface HealthInputFormProps {
  inputs: HealthInputs
  totalAssets: number
  onChange: (inputs: HealthInputs) => void
}

interface RupeeFieldProps {
  label: string
  value: number
  readOnly?: boolean
  hint?: string
  onChange?: (v: number) => void
  onBlur?: () => void
}

function RupeeField({ label, value, readOnly, hint, onChange, onBlur }: RupeeFieldProps) {
  const words = rupeesToWords(value)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-theme-muted flex items-center gap-1.5">
        {label}
        {readOnly && <Lock size={11} className="text-theme-muted" />}
      </label>
      {hint && <p className="text-xs text-theme-muted -mt-0.5">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none">₹</span>
        <input
          type="number"
          value={value}
          min={0}
          step={1000}
          readOnly={readOnly}
          onChange={readOnly ? undefined : (e) => onChange?.(Math.max(0, Number(e.target.value)))}
          onBlur={readOnly ? undefined : onBlur}
          className={`w-full pl-7 pr-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>
      <p className="text-xs text-theme-primary min-h-[16px] font-medium">{words}</p>
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  onBlur: () => void
}

function CheckboxField({ label, checked, onChange, onBlur }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => { onChange(e.target.checked); onBlur() }}
        className="w-4 h-4 rounded border-theme-border accent-theme-primary cursor-pointer"
      />
      <span className="text-sm text-theme-text group-hover:text-theme-primary transition-colors">
        {label}
      </span>
    </label>
  )
}

export const HealthInputForm = ({ inputs, totalAssets, onChange }: HealthInputFormProps) => {
  const { mutate: save } = useSaveHealthProfile()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const latestRef = useRef(inputs)
  latestRef.current = inputs

  const handleChange = (field: keyof HealthInputs, value: number | boolean) => {
    const updated = { ...inputs, [field]: value }
    onChange(updated)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(updated), 800)
  }

  const handleBlur = () => {
    clearTimeout(saveTimer.current)
    save(latestRef.current)
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-theme-text uppercase tracking-wider">
        Your Financial Profile
      </h2>

      <div className="flex flex-col gap-4">
        <p className="text-xs text-theme-muted uppercase tracking-wider">Monthly Cash Flow</p>
        <RupeeField label="Monthly Income (take-home)" value={inputs.monthlyIncome}
          onChange={(v) => handleChange('monthlyIncome', v)} onBlur={handleBlur} />
        <RupeeField label="Monthly Expenses" value={inputs.monthlyExpenses}
          onChange={(v) => handleChange('monthlyExpenses', v)} onBlur={handleBlur} />
        <RupeeField label="Monthly EMIs" value={inputs.monthlyEMIs}
          onChange={(v) => handleChange('monthlyEMIs', v)} onBlur={handleBlur} />
        <RupeeField label="Monthly Savings / Investments" value={inputs.monthlySavings}
          onChange={(v) => handleChange('monthlySavings', v)} onBlur={handleBlur} />
      </div>

      <div className="h-px bg-theme-border" />

      <div className="flex flex-col gap-4">
        <p className="text-xs text-theme-muted uppercase tracking-wider">Assets &amp; Liabilities</p>
        <RupeeField
          label="Total Assets (from Portfolio)"
          value={totalAssets}
          readOnly
          hint={`Auto-derived: ${formatRupeesCompact(totalAssets)}`}
        />
        <RupeeField label="Liquid Assets (savings, FD, liquid funds)" value={inputs.liquidAssets}
          onChange={(v) => handleChange('liquidAssets', v)} onBlur={handleBlur} />
        <RupeeField label="Total Liabilities (loans, credit card)" value={inputs.totalLiabilities}
          onChange={(v) => handleChange('totalLiabilities', v)} onBlur={handleBlur} />
      </div>

      <div className="h-px bg-theme-border" />

      <div className="flex flex-col gap-2">
        <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">Protection Checklist</p>
        <CheckboxField label="Term life insurance" checked={inputs.hasTermInsurance}
          onChange={(v) => handleChange('hasTermInsurance', v)} onBlur={handleBlur} />
        <CheckboxField label="Health / medical insurance" checked={inputs.hasHealthInsurance}
          onChange={(v) => handleChange('hasHealthInsurance', v)} onBlur={handleBlur} />
        <CheckboxField label="Will / legal succession plan" checked={inputs.hasWill}
          onChange={(v) => handleChange('hasWill', v)} onBlur={handleBlur} />
        <CheckboxField label="Nominations on all accounts" checked={inputs.hasNominations}
          onChange={(v) => handleChange('hasNominations', v)} onBlur={handleBlur} />
      </div>
    </div>
  )
}
