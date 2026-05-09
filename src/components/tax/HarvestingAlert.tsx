import React from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { formatRupees } from '../../utils/money'

interface HarvestingAlertProps {
  remaining: number
  isUrgent: boolean
}

export const HarvestingAlert = React.memo(function HarvestingAlert({
  remaining,
  isUrgent,
}: HarvestingAlertProps) {
  const bg   = isUrgent ? 'bg-danger/10 border-danger/30'   : 'bg-warning/10 border-warning/30'
  const text = isUrgent ? 'text-danger'                      : 'text-warning'
  const Icon = isUrgent ? AlertTriangle                      : TrendingUp

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg}`} role="alert">
      <Icon size={16} className={`${text} shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex flex-col gap-1 min-w-0">
        <p className={`text-sm font-semibold ${text}`}>
          {isUrgent ? 'Urgent: FY ending soon' : 'Harvesting opportunity'}
        </p>
        <p className="text-xs text-theme-muted leading-relaxed">
          Book{' '}
          <span className="font-mono text-theme-text">{formatRupees(remaining)}</span>{' '}
          of profits before 31 March — you still have room under the ₹1.25L LTCG exemption.
        </p>
      </div>
    </div>
  )
})
