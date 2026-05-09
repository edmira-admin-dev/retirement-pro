import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { formatRupeesCompact } from '../../utils/money'

interface CorpusGaugeProps {
  current: number
  target: number
}

export const CorpusGauge = ({ current, target }: CorpusGaugeProps) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const data = [{ value: pct }]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5">
      <p className="text-xs text-theme-muted uppercase tracking-wider mb-1">Corpus Progress</p>
      <div className="relative h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="65%"
            outerRadius="95%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              background={{ fill: 'var(--theme-border)' }}
              fill="#22c55e"
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1 pointer-events-none">
          <p className="text-2xl font-bold text-theme-text font-mono leading-none">
            {pct.toFixed(1)}%
          </p>
          <p className="text-xs text-theme-muted mt-1">
            {formatRupeesCompact(current)} of {formatRupeesCompact(target)}
          </p>
        </div>
      </div>
    </div>
  )
}
