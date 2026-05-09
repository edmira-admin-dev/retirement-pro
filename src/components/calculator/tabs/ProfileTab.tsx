import { SliderInput } from '../SliderInput'
import { RupeeField } from '../RupeeField'
import type { FireInputs } from '../../../types/fire'

interface ProfileTabProps {
  base: FireInputs
  onChange: (patch: Partial<FireInputs>) => void
  onBlur: () => void
}

export const ProfileTab = ({ base, onChange, onBlur }: ProfileTabProps) => (
  <div className="flex flex-col gap-4">
    <p className="text-xs text-theme-muted uppercase tracking-wider">Timeline</p>
    <SliderInput
      label="Current Age"
      value={base.currentAge}
      min={18}
      max={79}
      unit="yrs"
      onChange={(v) => onChange({ currentAge: v })}
      onBlur={onBlur}
    />
    <SliderInput
      label="Retirement Age"
      value={base.retirementAge}
      min={base.currentAge + 1}
      max={80}
      unit="yrs"
      onChange={(v) => onChange({ retirementAge: v })}
      onBlur={onBlur}
    />
    <SliderInput
      label="Life Expectancy"
      value={base.lifeExpectancy}
      min={base.retirementAge + 1}
      max={110}
      unit="yrs"
      onChange={(v) => onChange({ lifeExpectancy: v })}
      onBlur={onBlur}
    />

    <div className="h-px bg-theme-border" />

    <p className="text-xs text-theme-muted uppercase tracking-wider">Monthly Expenses (Today)</p>
    <RupeeField
      label="General Living"
      value={base.currentMonthlyExpense}
      onChange={(v) => onChange({ currentMonthlyExpense: v })}
      onBlur={onBlur}
    />
    <RupeeField
      label="Medical"
      value={base.medicalMonthlyExpense}
      onChange={(v) => onChange({ medicalMonthlyExpense: v })}
      onBlur={onBlur}
    />
    <SliderInput
      label="Lifestyle Buffer"
      value={base.lifestyleBuffer}
      min={0}
      max={5}
      step={0.5}
      unit="%"
      onChange={(v) => onChange({ lifestyleBuffer: v })}
      onBlur={onBlur}
    />

    <div className="h-px bg-theme-border" />

    <p className="text-xs text-theme-muted uppercase tracking-wider">Expected Returns</p>
    <SliderInput
      label="Pre-retirement"
      value={base.expectedReturnPre}
      min={4}
      max={20}
      step={0.5}
      unit="% pa"
      onChange={(v) => onChange({ expectedReturnPre: v })}
      onBlur={onBlur}
    />
    <SliderInput
      label="Post-retirement"
      value={base.expectedReturnPost}
      min={4}
      max={15}
      step={0.5}
      unit="% pa"
      onChange={(v) => onChange({ expectedReturnPost: v })}
      onBlur={onBlur}
    />
  </div>
)
