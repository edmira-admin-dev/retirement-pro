import { useState, useEffect } from 'react'
import { rupeesToWords } from '../../utils/money'

interface MoneyInputProps {
  label: string
  value: string | number
  onChange: (raw: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  min?: number
  id?: string
  optional?: boolean
  hint?: string
  className?: string
}

function toDisplay(raw: string | number): string {
  const n = typeof raw === 'number' ? raw : parseFloat(raw.toString().replace(/,/g, ''))
  if (!n || !isFinite(n)) return ''
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

/**
 * Numeric money input with ₹ prefix, live Indian comma formatting (1,00,000),
 * and Indian-words subtext on each keystroke.
 */
export function MoneyInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder = '0',
  required,
  min,
  id,
  optional,
  hint,
  className,
}: MoneyInputProps) {
  const [display, setDisplay] = useState(() => toDisplay(value))

  // Sync when parent resets/changes value externally
  useEffect(() => {
    const incoming = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''))
    const current = parseFloat(display.replace(/,/g, '')) || 0
    if (incoming !== current) setDisplay(toDisplay(value))
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const numVal = parseFloat(display.replace(/,/g, '')) || 0
  const words = rupeesToWords(numVal)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    // Allow only digits and at most one decimal point
    const stripped = raw.replace(/[^0-9.]/g, '')
    const parts = stripped.split('.')
    const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : stripped

    if (clean === '' || clean === '.') {
      setDisplay('')
      onChange('')
      return
    }

    const num = parseFloat(clean)
    if (!isFinite(num)) return

    // Respect min constraint silently (don't block typing, validate on blur)
    const intPart = clean.includes('.') ? clean.split('.')[0] : clean
    const decPart = clean.includes('.') ? '.' + (clean.split('.')[1] ?? '') : ''

    const formatted =
      Number(intPart).toLocaleString('en-IN') + decPart

    setDisplay(formatted)
    onChange(String(num))
  }

  function handleBlur() {
    // On blur, reformat cleanly (drop trailing dot/zeros after decimal)
    const num = parseFloat(display.replace(/,/g, ''))
    if (num && isFinite(num)) {
      if (min !== undefined && num < min) {
        setDisplay(toDisplay(min))
        onChange(String(min))
      } else {
        setDisplay(toDisplay(num))
      }
    } else {
      setDisplay('')
    }
    onBlur?.()
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-theme-text mb-1">
        {label}
        {optional && <span className="text-theme-muted font-normal ml-1">(opt)</span>}
      </label>
      {hint && <p className="text-xs text-theme-muted -mt-0.5 mb-1">{hint}</p>}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted text-sm pointer-events-none select-none">
          ₹
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          required={required}
          value={display}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full pl-7 pr-3 py-2 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary transition-colors"
        />
      </div>
      <p className="text-xs text-theme-primary mt-1 min-h-[16px] font-medium">
        {words}
      </p>
    </div>
  )
}
