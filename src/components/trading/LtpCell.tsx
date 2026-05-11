import { useState, useRef } from 'react'
import { Pencil, Check, Loader2 } from 'lucide-react'
import { useUpdateLtp } from '../../hooks/useTrades'
import { toPaise, toRupees } from '../../utils/money'

interface LtpCellProps {
  symbol: string
  ltpPaise: number
}

export function LtpCell({ symbol, ltpPaise }: LtpCellProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useUpdateLtp()

  function startEdit() {
    setValue(ltpPaise ? String(toRupees(ltpPaise)) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function save() {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed >= 0) {
      mutate({ symbol, ltpPaise: toPaise(parsed) })
    }
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  if (isPending) {
    return (
      <span className="flex items-center gap-1 text-theme-muted text-sm">
        <Loader2 size={13} className="animate-spin" />
      </span>
    )
  }

  if (editing) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-theme-muted text-xs">₹</span>
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
          className="w-20 px-1.5 py-0.5 rounded border border-theme-primary bg-theme-bg-alt text-theme-text text-sm focus:outline-none"
          aria-label="Enter LTP"
        />
        <button onClick={save} className="text-theme-primary cursor-pointer" aria-label="Save LTP">
          <Check size={13} />
        </button>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 group">
      <span className="text-sm text-theme-text">
        {ltpPaise ? `₹${toRupees(ltpPaise).toLocaleString('en-IN')}` : <span className="text-theme-muted">—</span>}
      </span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 text-theme-muted hover:text-theme-primary transition-opacity cursor-pointer"
        aria-label="Edit LTP"
      >
        <Pencil size={11} />
      </button>
    </span>
  )
}
