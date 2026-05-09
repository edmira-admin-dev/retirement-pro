import { rupeesToWords } from '../../utils/money'

interface RupeeFieldProps {
  label: string
  value: number
  onChange: (v: number) => void
  onBlur?: () => void
  placeholder?: string
  hint?: string
  readOnly?: boolean
}

export const RupeeField = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  readOnly = false,
}: RupeeFieldProps) => {
  const words = rupeesToWords(value)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-theme-muted">{label}</label>
        {hint && <span className="text-xs text-theme-muted">{hint}</span>}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none">
          ₹
        </span>
        <input
          type="number"
          value={value}
          min={0}
          step={1000}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          onBlur={onBlur}
          className="w-full pl-7 pr-3 py-2 bg-theme-bg-alt border border-theme-border rounded-lg text-sm text-theme-text font-mono focus:outline-none focus:ring-1 focus:ring-theme-primary disabled:opacity-60 read-only:opacity-60 read-only:cursor-default"
        />
      </div>
      <p className="text-xs text-theme-primary min-h-[16px] font-medium">
        {words}
      </p>
    </div>
  )
}
