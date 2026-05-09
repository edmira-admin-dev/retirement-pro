interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  onBlur?: () => void
}

export const SliderInput = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  onBlur,
}: SliderInputProps) => {
  const handleNumberChange = (raw: string) => {
    const n = parseFloat(raw)
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-theme-muted">{label}</label>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleNumberChange(e.target.value)}
            onBlur={onBlur}
            className="w-16 text-right text-sm font-mono text-theme-text bg-theme-bg-alt border border-theme-border rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
          {unit && <span className="text-xs text-theme-muted w-8">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        className="w-full h-1.5 rounded-full appearance-none bg-theme-border cursor-pointer accent-theme-primary"
      />
    </div>
  )
}
