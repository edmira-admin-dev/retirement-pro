import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useExpenseSummary } from '../../hooks/useExpenses'
import { formatRupeesCompact, toRupees } from '../../utils/money'
import type { ExpenseType, ExpenseCategory } from '../../types/expense'

const TYPE_COLORS: Record<ExpenseType, string> = {
  FIXED: '#2563eb',
  DISCRETIONARY: '#f59e0b',
  LOAN: '#9333ea',
}

const TYPE_LABELS: Record<ExpenseType, string> = {
  FIXED: 'Fixed',
  DISCRETIONARY: 'Discretionary',
  LOAN: 'Loan EMIs',
}

const CAT_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent', ELECTRICITY: 'Electricity', WATER: 'Water', GAS: 'Gas', INTERNET: 'Internet',
  GROCERY: 'Grocery', COOK: 'Cook', DRIVER: 'Driver', MAID: 'Maid', INSURANCE: 'Insurance',
  SUBSCRIPTIONS: 'Subscriptions', FIXED_OTHER: 'Other',
  FOOD: 'Food', TRANSPORT: 'Transport', HEALTHCARE: 'Healthcare', ENTERTAINMENT: 'Entertainment',
  SHOPPING: 'Shopping', EDUCATION: 'Education', TRAVEL: 'Travel', INVESTMENT: 'Investment', DISC_OTHER: 'Other',
  HOME_LOAN_EMI: 'Home Loan', CAR_LOAN_EMI: 'Car Loan', PERSONAL_LOAN_EMI: 'Personal Loan',
  EDUCATION_LOAN_EMI: 'Education Loan', CREDIT_CARD_EMI: 'Credit Card', LOAN_OTHER: 'Other',
}

const FIXED_CATS = new Set(['RENT', 'ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'GROCERY', 'COOK', 'DRIVER', 'MAID', 'INSURANCE', 'SUBSCRIPTIONS', 'FIXED_OTHER'])
const DISC_CATS = new Set(['FOOD', 'TRANSPORT', 'HEALTHCARE', 'ENTERTAINMENT', 'SHOPPING', 'EDUCATION', 'TRAVEL', 'INVESTMENT', 'DISC_OTHER'])

function typeOfCat(cat: string): ExpenseType {
  if (FIXED_CATS.has(cat)) return 'FIXED'
  if (DISC_CATS.has(cat)) return 'DISCRETIONARY'
  return 'LOAN'
}

interface CategoryBreakdownProps {
  month: string
}

export function CategoryBreakdown({ month }: CategoryBreakdownProps) {
  const { data: summary } = useExpenseSummary(month)
  const [drillType, setDrillType] = useState<ExpenseType | null>(null)

  const byType = summary?.byType
  const typeData = byType
    ? (['FIXED', 'DISCRETIONARY', 'LOAN'] as ExpenseType[])
        .map((t) => ({ name: TYPE_LABELS[t], value: toRupees(byType[t]), type: t }))
        .filter((d) => d.value > 0)
    : []

  const catData = drillType && summary?.byCategory
    ? Object.entries(summary.byCategory)
        .filter(([cat]) => typeOfCat(cat) === drillType)
        .map(([cat, paise]) => ({ name: CAT_LABELS[cat as ExpenseCategory] ?? cat, value: toRupees(paise ?? 0) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
    : []

  if (typeData.length === 0) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-6 text-center">
        <p className="text-theme-muted text-sm">No data for this period.</p>
      </div>
    )
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-theme-text">Spending Breakdown</h3>
        {drillType && (
          <button onClick={() => setDrillType(null)} className="text-xs text-theme-primary hover:underline cursor-pointer">
            ← All types
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-full sm:w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={drillType ? catData : typeData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                dataKey="value"
                onClick={(entry) => {
                  if (!drillType) {
                    const t = typeData.find((d) => d.name === entry.name)
                    if (t) setDrillType(t.type)
                  }
                }}
                style={{ cursor: drillType ? 'default' : 'pointer' }}
              >
                {(drillType ? catData : typeData).map((_, i) => (
                  <Cell
                    key={i}
                    fill={drillType
                      ? `hsl(${240 + i * 35}, 60%, ${55 + i * 5}%)`
                      : TYPE_COLORS[(typeData[i]?.type as ExpenseType) ?? 'FIXED']
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatRupeesCompact(Number(v ?? 0)), '']}
                contentStyle={{ fontSize: 12, background: 'var(--theme-card)', border: '1px solid var(--theme-border)', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full">
          {(drillType ? catData : typeData).map((item, i) => {
            const total = (drillType ? catData : typeData).reduce((s, d) => s + d.value, 0)
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            const color = drillType
              ? `hsl(${240 + i * 35}, 60%, ${55 + i * 5}%)`
              : TYPE_COLORS[(typeData[i]?.type as ExpenseType) ?? 'FIXED']
            return (
              <div
                key={item.name}
                className={`flex items-center gap-3 py-2 ${!drillType ? 'cursor-pointer hover:bg-theme-bg-alt rounded-lg px-2 -mx-2 transition-colors' : ''}`}
                onClick={() => { if (!drillType) { const t = typeData[i]; if (t) setDrillType(t.type) } }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm text-theme-text flex-1 truncate">{item.name}</span>
                <span className="text-xs text-theme-muted font-mono">{pct}%</span>
                <span className="text-sm font-semibold text-theme-text font-mono">{formatRupeesCompact(item.value)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
