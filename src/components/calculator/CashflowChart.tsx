import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatRupeesCompact } from '../../utils/money'
import type { SimulationYear } from '../../types/fire'

function fmtY(v: number) {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(0)}Cr`
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(0)}L`
  return `₹${v}`
}

interface Props {
  years: SimulationYear[]
  retirementAge: number
}

export const CashflowChart = ({ years, retirementAge }: Props) => {
  const data = years
    .filter((y) => y.age < retirementAge)
    .map((y) => ({
      age: y.age,
      Income: Math.round(y.grossIncome),
      Expenses: Math.round(y.totalExpenses),
      EMIs: Math.round(y.totalEmiPayments),
      Surplus: Math.round(y.investableSurplus),
    }))

  if (data.length === 0) return null

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-theme-text">Cashflow (Accumulation Phase)</h2>
        <p className="text-xs text-theme-muted mt-0.5">Annual income vs expenses vs investable surplus</p>
      </div>

      <div className="overflow-x-auto -mx-1">
        <div style={{ minWidth: 600 }} className="px-1">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
              <XAxis
                dataKey="age"
                tick={{ fill: 'var(--theme-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--theme-border)' }}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                tick={{ fill: 'var(--theme-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={fmtY}
                width={56}
              />
              <Tooltip
                formatter={(v: unknown, name: unknown) => [formatRupeesCompact(Number(v)), String(name)]}
                labelFormatter={(l) => `Age ${l}`}
                contentStyle={{
                  background: 'var(--theme-card)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--theme-muted)' }} />
              <Bar dataKey="Income" stackId="a" fill="var(--theme-primary)" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expenses" stackId="b" fill="#ef4444" opacity={0.7} />
              <Bar dataKey="EMIs" stackId="b" fill="#f59e0b" opacity={0.7} />
              <Line type="monotone" dataKey="Surplus" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
