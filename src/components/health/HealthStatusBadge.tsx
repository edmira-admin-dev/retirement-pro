import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react'
import type { HealthResult } from '../../types/health'

interface HealthStatusBadgeProps {
  status: HealthResult['status']
}

const CONFIG = {
  Healthy: {
    label: 'Financially Healthy',
    icon: ShieldCheck,
    className: 'bg-success/15 text-success border-success/30',
  },
  Coping: {
    label: 'Coping',
    icon: AlertTriangle,
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  Vulnerable: {
    label: 'Vulnerable',
    icon: AlertOctagon,
    className: 'bg-danger/15 text-danger border-danger/30',
  },
} as const

export const HealthStatusBadge = ({ status }: HealthStatusBadgeProps) => {
  const { label, icon: Icon, className } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${className}`}
    >
      <Icon size={13} />
      {label}
    </span>
  )
}
