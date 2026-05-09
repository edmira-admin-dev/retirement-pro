import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { HealthStatusBadge } from './HealthStatusBadge'
import type { HealthResult } from '../../types/health'

interface HealthScoreGaugeProps {
  result: HealthResult
}

export const HealthScoreGauge = ({ result }: HealthScoreGaugeProps) => {
  const { overallScore, status } = result

  const fill =
    overallScore >= 70 ? '#22c55e' : overallScore >= 40 ? '#f59e0b' : '#ef4444'

  const data = [{ value: overallScore }]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col items-center gap-2">
      <p className="text-xs text-theme-muted uppercase tracking-wider self-start">
        Financial Wellness Score
      </p>
      <div className="relative w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="90%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: 'var(--theme-border)' }}
              fill={fill}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none">
          <p className="text-5xl font-bold font-mono leading-none" style={{ color: fill }}>
            {overallScore}
          </p>
          <p className="text-xs text-theme-muted mt-1">out of 100</p>
        </div>
      </div>
      <HealthStatusBadge status={status} />
    </div>
  )
}
