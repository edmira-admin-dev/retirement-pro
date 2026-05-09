import React from 'react'
import { ArrowDownRight } from 'lucide-react'
import { formatRupeesCompact } from '../../utils/money'

interface GlideDownAlertProps {
  excess: number
  yearsToRetirement: number
}

export const GlideDownAlert = React.memo(function GlideDownAlert({
  excess,
  yearsToRetirement,
}: GlideDownAlertProps) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
      role="alert"
    >
      <ArrowDownRight size={16} className="text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-semibold text-blue-400">Glide-Down Recommended</p>
        <p className="text-xs text-theme-muted leading-relaxed">
          {yearsToRetirement} year{yearsToRetirement !== 1 ? 's' : ''} to retirement — shift{' '}
          <span className="font-mono text-theme-text">{formatRupeesCompact(excess)}</span> from
          Bucket 3 → Bucket 2 to reduce sequence-of-returns risk.
        </p>
      </div>
    </div>
  )
})
