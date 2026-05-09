import { SliderInput } from '../SliderInput'
import { formatRupees } from '../../../utils/money'
import type { RetirementAssumptions } from '../../../types/fire'

const SECTION_80C_LIMIT = 150_000

interface AssumptionsTabProps {
  assumptions: RetirementAssumptions
  section80cUtilization: number
  onChange: (patch: Partial<RetirementAssumptions>) => void
  onBlur: () => void
}

export const AssumptionsTab = ({
  assumptions,
  section80cUtilization,
  onChange,
  onBlur,
}: AssumptionsTabProps) => {
  const pct80c = Math.min((section80cUtilization / SECTION_80C_LIMIT) * 100, 100)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-theme-muted uppercase tracking-wider">Retirement Assumptions</p>

      <SliderInput
        label="Safe Withdrawal Rate (SWR)"
        value={assumptions.withdrawalRate}
        min={2.5}
        max={5}
        step={0.25}
        unit="% pa"
        onChange={(v) => onChange({ withdrawalRate: v })}
        onBlur={onBlur}
      />
      <p className="text-xs text-theme-muted -mt-2">
        India-recommended: 3–3.5% for 30+ year retirements
      </p>

      <div className="h-px bg-theme-border" />

      <p className="text-xs text-theme-muted uppercase tracking-wider">Inflation Overrides</p>
      <SliderInput
        label="General inflation"
        value={assumptions.generalInflation}
        min={4}
        max={10}
        step={0.5}
        unit="% pa"
        onChange={(v) => onChange({ generalInflation: v })}
        onBlur={onBlur}
      />
      <SliderInput
        label="Medical inflation"
        value={assumptions.medicalInflation}
        min={7}
        max={15}
        step={0.5}
        unit="% pa"
        onChange={(v) => onChange({ medicalInflation: v })}
        onBlur={onBlur}
      />

      <div className="h-px bg-theme-border" />

      <p className="text-xs text-theme-muted uppercase tracking-wider">Section 80C</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-muted">Utilized</span>
          <span className="font-mono text-theme-text">
            {formatRupees(section80cUtilization)} / {formatRupees(SECTION_80C_LIMIT)}
          </span>
        </div>
        <div className="h-2 bg-theme-border rounded-full overflow-hidden">
          <div
            className="h-full bg-theme-primary rounded-full transition-all"
            style={{ width: `${pct80c}%` }}
          />
        </div>
        <p className="text-xs text-theme-muted">
          {section80cUtilization > 0
            ? `NPS contribution counts toward 80C limit`
            : `Add NPS contributions on the Portfolio tab to track 80C usage`}
        </p>
      </div>
    </div>
  )
}
