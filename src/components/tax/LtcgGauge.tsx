import React from 'react'
import { formatRupees } from '../../utils/money'
import { LTCG_LIMIT } from '../../utils/taxCalc'

interface LtcgGaugeProps {
  realizedGainsFY: number  // ₹
  pct: number              // 0–100
}

export const LtcgGauge = React.memo(function LtcgGauge({ realizedGainsFY, pct }: LtcgGaugeProps) {
  const barColor =
    pct >= 100 ? 'bg-danger' :
    pct >= 80  ? 'bg-warning' :
                 'bg-theme-primary'

  const labelColor =
    pct >= 100 ? 'text-danger' :
    pct >= 80  ? 'text-warning' :
                 'text-theme-text'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-theme-muted">LTCG used this FY</span>
        <span className={`text-xs font-mono font-semibold ${labelColor}`}>
          {formatRupees(realizedGainsFY)} / {formatRupees(LTCG_LIMIT)}
        </span>
      </div>

      <div className="relative h-2.5 bg-theme-bg rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="LTCG limit utilisation"
        />
        <div
          className="absolute top-0 h-full w-px bg-theme-border/80"
          style={{ left: '80%' }}
          aria-hidden="true"
        />
      </div>

      <div className="flex justify-between text-[10px] text-theme-muted">
        <span>₹0</span>
        <span>80% threshold</span>
        <span>₹1.25L limit</span>
      </div>
    </div>
  )
})
