import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatRupeesCompact } from '../../utils/money'
import type { BucketAllocation, BucketIdeal } from '../../types/tax'

interface BucketAllocationCardProps {
  actual: BucketAllocation
  ideal: BucketIdeal
}

interface PayloadEntry {
  name: string
  value: number
  color: string
}

interface BucketTooltipProps {
  active?: boolean
  payload?: PayloadEntry[]
  label?: string
}

function BucketTooltip({ active, payload, label }: BucketTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-theme-card border border-theme-border rounded-lg p-2.5 text-xs shadow-xl">
      <p className="text-theme-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatRupeesCompact(p.value)}
        </p>
      ))}
    </div>
  )
}

const BUCKET_META = [
  { key: 'bucket1', label: 'Bucket 1', sub: 'Liquid' },
  { key: 'bucket2', label: 'Bucket 2', sub: 'Safe (EPF/NPS/PPF)' },
  { key: 'bucket3', label: 'Bucket 3', sub: 'Growth (MF/Stock)' },
]

export const BucketAllocationCard = React.memo(function BucketAllocationCard({
  actual,
  ideal,
}: BucketAllocationCardProps) {
  const chartData = [
    { name: 'Liquid',  actual: actual.bucket1, ideal: ideal.bucket1 },
    { name: 'Safe',    actual: actual.bucket2, ideal: ideal.bucket2 },
    { name: 'Growth',  actual: actual.bucket3, ideal: ideal.bucket3 },
  ]

  const actuals = [actual.bucket1, actual.bucket2, actual.bucket3]
  const ideals  = [ideal.bucket1,  ideal.bucket2,  ideal.bucket3]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-theme-text">3-Bucket Allocation</h3>
        <p className="text-xs text-theme-muted mt-0.5">Actual vs ideal — derived from your holdings</p>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="35%" barGap={4}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--theme-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatRupeesCompact(v)}
              tick={{ fill: 'var(--theme-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<BucketTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--theme-muted)', paddingTop: 8 }} />
            <Bar name="Actual" dataKey="actual" fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar name="Ideal"  dataKey="ideal"  fill="#475569" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {BUCKET_META.map(({ key, sub }, i) => {
          const av = actuals[i]
          const iv = ideals[i]
          const status = iv === 0 ? 'no-data' : av > iv * 1.1 ? 'over' : av < iv * 0.9 ? 'under' : 'ok'
          const statusColor =
            status === 'over'    ? 'text-warning' :
            status === 'under'   ? 'text-blue-400' :
            status === 'no-data' ? 'text-theme-muted' :
                                   'text-theme-primary'
          const statusLabel =
            status === 'over' ? 'Over' : status === 'under' ? 'Under' : status === 'no-data' ? '—' : 'On track'

          return (
            <div
              key={key}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-theme-bg border border-theme-border"
            >
              <p className="text-[10px] text-theme-muted leading-tight">{sub}</p>
              <p className="text-sm font-mono font-semibold text-theme-text">{formatRupeesCompact(av)}</p>
              <p className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
