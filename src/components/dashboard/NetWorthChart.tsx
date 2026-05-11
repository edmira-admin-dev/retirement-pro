import { memo, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatRupeesCompact } from '../../utils/money'
import type { NetWorthPoint } from '../../hooks/useNetWorthHistory'

type Range = '1M' | '3M' | '6M' | '1Y' | 'ALL'

const RANGES: Range[] = ['1M', '3M', '6M', '1Y', 'ALL']

const RANGE_DAYS: Record<Range, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  ALL: Infinity,
}

function filterByRange(data: NetWorthPoint[], range: Range): NetWorthPoint[] {
  if (range === 'ALL') return data
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range])
  const cutoffStr = cutoff.toISOString().split('T')[0]!
  return data.filter((p) => p.date >= cutoffStr)
}

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year!, month! - 1, day!)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function formatDateFull(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year!, month! - 1, day!)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl px-3 py-2 shadow-md">
      <p className="text-[11px] text-theme-muted mb-0.5">{formatDateFull(label)}</p>
      <p className="text-sm font-bold font-mono text-theme-text">
        {formatRupeesCompact(payload[0]!.value)}
      </p>
    </div>
  )
})

interface Props {
  data: NetWorthPoint[]
}

export const NetWorthChart = memo(function NetWorthChart({ data }: Props) {
  const [range, setRange] = useState<Range>('ALL')

  const filtered = useMemo(() => filterByRange(data, range), [data, range])

  const { first, last, change, changePct, isUp } = useMemo(() => {
    if (filtered.length < 2) {
      const v = filtered[0]?.value ?? 0
      return { first: v, last: v, change: 0, changePct: 0, isUp: true }
    }
    const f = filtered[0]!.value
    const l = filtered[filtered.length - 1]!.value
    const diff = l - f
    return {
      first: f,
      last: l,
      change: diff,
      changePct: f !== 0 ? (diff / f) * 100 : 0,
      isUp: diff >= 0,
    }
  }, [filtered])

  if (data.length === 0) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-h-[180px]">
        <TrendingUp size={28} className="text-theme-muted" />
        <p className="text-sm text-theme-muted">Net worth history will appear here after your first update</p>
      </div>
    )
  }

  const yMin = Math.min(...filtered.map((p) => p.value))
  const yMax = Math.max(...filtered.map((p) => p.value))
  const yPad = (yMax - yMin) * 0.1 || yMax * 0.1 || 10000

  return (
    <div className="bg-theme-card border border-theme-border rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-1">
            Net Worth Timeline
          </p>
          <p className="text-2xl font-bold font-mono text-theme-text">
            {formatRupeesCompact(last)}
          </p>
          {filtered.length >= 2 && (
            <div className={`flex items-center gap-1 mt-0.5 text-xs font-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
              {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>
                {isUp ? '+' : ''}{formatRupeesCompact(change)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Range pills */}
        <div className="flex items-center gap-1 bg-theme-bg-alt rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === r
                  ? 'bg-theme-primary text-white shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--theme-border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 10, fill: 'var(--theme-muted)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={60}
            />
            <YAxis
              tickFormatter={(v: number) => formatRupeesCompact(v)}
              tick={{ fontSize: 10, fill: 'var(--theme-muted)' }}
              axisLine={false}
              tickLine={false}
              width={64}
              domain={[yMin - yPad, yMax + yPad]}
            />
            <Tooltip content={<CustomTooltip />} />
            {filtered.length >= 2 && (
              <ReferenceLine
                y={first}
                stroke="var(--theme-border)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--theme-primary)"
              strokeWidth={2}
              fill="url(#nwGradient)"
              dot={filtered.length <= 10 ? { r: 3, fill: 'var(--theme-primary)', strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: 'var(--theme-primary)', strokeWidth: 2, stroke: 'var(--theme-card)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
})
