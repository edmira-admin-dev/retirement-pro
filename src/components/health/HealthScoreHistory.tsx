import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useHealthScoreHistory } from '../../hooks/useHealthProfile'
import type { HealthScoreEntry } from '../../types/health'

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

interface TooltipData {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipData) => {
  if (!active || !payload?.length) return null
  const score = payload[0].value
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="bg-theme-card border border-theme-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-theme-muted mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono leading-none" style={{ color }}>{score}</p>
      <p className="text-xs text-theme-muted mt-0.5">/ 100</p>
    </div>
  )
}

export const HealthScoreHistory = () => {
  const { data: history, isLoading } = useHealthScoreHistory()

  if (isLoading) return null

  if (!history?.length) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex items-center gap-3">
        <TrendingUp size={14} className="text-theme-muted shrink-0" />
        <p className="text-xs text-theme-muted">
          Score history will appear here as you update your profile over time.
        </p>
      </div>
    )
  }

  const chartData = history.map((e: HealthScoreEntry) => ({
    date: formatDate(e.snapshotDate),
    score: e.score,
  }))

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={13} className="text-theme-primary" />
        <p className="text-xs font-semibold text-theme-text uppercase tracking-wider">Score History</p>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--theme-muted)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--theme-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.4} />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--theme-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--theme-primary)', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-theme-muted">
        <span className="text-green-500 font-medium">―</span> Healthy ≥70 &nbsp;
        <span className="text-amber-500 font-medium">―</span> Coping ≥40 &nbsp;
        <span className="text-red-500 font-medium">―</span> Vulnerable &lt;40
      </p>
    </div>
  )
}
