import { useState, useRef, useEffect } from 'react'
import { useTaxProfile, useSaveTaxProfile } from '../../hooks/useTaxProfile'
import { useHoldings } from '../../hooks/useHoldings'
import { useFireProfile } from '../../hooks/useFireProfile'
import { computeBuckets, computeIdealBuckets, computeLtcg } from '../../utils/taxCalc'
import { computeFireResult } from '../../utils/fireCalc'
import { LtcgGauge } from './LtcgGauge'
import { HarvestingAlert } from './HarvestingAlert'
import { BucketAllocationCard } from './BucketAllocationCard'
import { GlideDownAlert } from './GlideDownAlert'
import type { TaxInputs } from '../../types/tax'

const DEFAULT_INPUTS: TaxInputs = { realizedGainsFY: 0, unrealizedEquityGains: 0 }

interface RupeeInputProps {
  label: string
  id: string
  value: number
  onChange: (v: number) => void
  onBlur: () => void
}

function RupeeInput({ label, id, value, onChange, onBlur }: RupeeInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-theme-muted">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none">
          ₹
        </span>
        <input
          id={id}
          type="number"
          value={value}
          min={0}
          step={1000}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          onBlur={onBlur}
          className="w-full pl-7 pr-3 py-2.5 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary"
        />
      </div>
    </div>
  )
}

export function TaxAlertsSection() {
  const { data: saved }           = useTaxProfile()
  const { mutate: save }          = useSaveTaxProfile()
  const { data: holdings = [] }   = useHoldings()
  const { data: fireProfile }     = useFireProfile()

  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_INPUTS)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const latestRef = useRef(inputs)
  latestRef.current = inputs

  useEffect(() => {
    if (saved) setInputs(saved)
  }, [saved])

  const handleChange = (field: keyof TaxInputs, value: number) => {
    const updated = { ...inputs, [field]: value }
    setInputs(updated)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(updated), 800)
  }

  const handleBlur = () => {
    clearTimeout(saveTimer.current)
    save(latestRef.current)
  }

  const ltcg         = computeLtcg(inputs)
  const buckets      = computeBuckets(holdings)
  const portfolio    = holdings.reduce((s, h) => s + h.currentValue, 0)
  const fireBase     = fireProfile?.base ?? null
  const fireResult   = fireBase ? computeFireResult(fireBase, portfolio) : null
  const idealBuckets = fireResult
    ? computeIdealBuckets(fireResult)
    : { bucket1: 0, bucket2: 0, bucket3: 0 }

  const yearsToRetirement = fireBase
    ? Math.max(0, fireBase.retirementAge - fireBase.currentAge)
    : null
  const showGlideDown = yearsToRetirement !== null && yearsToRetirement <= 5
  const bucket3Excess = Math.max(0, buckets.bucket3 - idealBuckets.bucket3)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-theme-text">Tax Alerts</h2>
        <p className="text-xs text-theme-muted mt-0.5">LTCG harvesting + 3-bucket allocation</p>
      </div>

      <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-theme-muted">
          This Financial Year
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RupeeInput
            label="Realized Equity Gains (FY)"
            id="realizedGainsFY"
            value={inputs.realizedGainsFY}
            onChange={(v) => handleChange('realizedGainsFY', v)}
            onBlur={handleBlur}
          />
          <RupeeInput
            label="Unrealized Equity Gains"
            id="unrealizedEquityGains"
            value={inputs.unrealizedEquityGains}
            onChange={(v) => handleChange('unrealizedEquityGains', v)}
            onBlur={handleBlur}
          />
        </div>
        <LtcgGauge realizedGainsFY={inputs.realizedGainsFY} pct={ltcg.pct} />
      </div>

      {ltcg.showAlert && (
        <HarvestingAlert remaining={ltcg.remaining} isUrgent={ltcg.isUrgent} />
      )}

      <BucketAllocationCard actual={buckets} ideal={idealBuckets} />

      {showGlideDown && bucket3Excess > 0 && (
        <GlideDownAlert
          excess={bucket3Excess}
          yearsToRetirement={yearsToRetirement ?? 0}
        />
      )}
    </div>
  )
}
