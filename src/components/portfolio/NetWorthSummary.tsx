import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatRupees, formatRupeesCompact } from '../../utils/money'
import type { Holding, AssetClass } from '../../types/holdings'

interface NetWorthSummaryProps {
  holdings: Holding[]
}

const COLORS: Record<AssetClass, string> = {
  MF:          '#3b82f6',
  NPS:         '#a855f7',
  EPF:         '#f97316',
  PPF:         '#eab308',
  STOCK:       '#22c55e',
  BANK:        '#0ea5e9',
  LIQUID:      '#14b8a6',
  FD:          '#f59e0b',
  BOND:        '#6366f1',
  ETF:         '#06b6d4',
  GOLD:        '#fbbf24',
  REAL_ESTATE: '#f43f5e',
  ANNUITY:     '#8b5cf6',
  INTL_EQUITY: '#10b981',
  INTL_DEBT:   '#84cc16',
  COMMODITY:   '#f97316',
}

const LABELS: Record<AssetClass, string> = {
  MF:          'Mutual Funds',
  NPS:         'NPS',
  EPF:         'EPF',
  PPF:         'PPF',
  STOCK:       'Stocks',
  BANK:        'Bank / Cash',
  LIQUID:      'Liquid Funds',
  FD:          'Fixed Deposits',
  BOND:        'Bonds',
  ETF:         'ETFs',
  GOLD:        'Gold & Silver',
  REAL_ESTATE: 'Real Estate',
  ANNUITY:     'Annuity',
  INTL_EQUITY: 'Intl Equity',
  INTL_DEBT:   'Intl Debt',
  COMMODITY:   'Commodities',
}

interface TooltipPayload {
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-theme-card border border-theme-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-theme-muted">{payload[0].name}</p>
      <p className="text-theme-text font-medium">{formatRupees(payload[0].value)}</p>
    </div>
  )
}

export function NetWorthSummary({ holdings }: NetWorthSummaryProps) {
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalGain = totalCurrent - totalInvested
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const isGain = totalGain >= 0

  const byClass = holdings.reduce<Partial<Record<AssetClass, number>>>((acc, h) => {
    acc[h.assetClass] = (acc[h.assetClass] ?? 0) + h.currentValue
    return acc
  }, {})

  const pieData = (Object.keys(byClass) as AssetClass[]).map((cls) => ({
    name: LABELS[cls] ?? cls,
    value: byClass[cls] ?? 0,
    color: COLORS[cls] ?? '#94a3b8',
  }))

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-theme-muted uppercase tracking-wide">Net Worth</p>
          <p className="text-3xl font-bold text-theme-text font-mono">
            {formatRupeesCompact(totalCurrent)}
          </p>
          <div className="flex items-center gap-1.5">
            {isGain ? (
              <TrendingUp size={14} className="text-success" />
            ) : (
              <TrendingDown size={14} className="text-danger" />
            )}
            <span className={`text-sm font-medium ${isGain ? 'text-success' : 'text-danger'}`}>
              {isGain ? '+' : ''}{formatRupeesCompact(Math.abs(totalGain))}
            </span>
            <span className={`text-xs ${isGain ? 'text-success' : 'text-danger'}`}>
              ({isGain ? '+' : ''}{gainPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {pieData.length > 0 && (
          <div className="w-full sm:w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {pieData.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-theme-border">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-theme-muted">{entry.name}</span>
              <span className="text-xs text-theme-text font-medium">
                {totalCurrent > 0 ? ((entry.value / totalCurrent) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
