import { TrendingUp, TrendingDown, Minus, IndianRupee, CalendarDays, Award } from 'lucide-react'
import { useIncomeSummary } from '../../hooks/useIncome'
import { formatRupeesCompact, toRupees } from '../../utils/money'
import type { IncomeCategory } from '../../types/income'

const CATEGORY_LABELS: Record<IncomeCategory, string> = {
  SALARY: 'Salary', FREELANCE: 'Freelance', RENTAL: 'Rental',
  DIVIDEND: 'Dividend', BUSINESS: 'Business', INTEREST: 'Interest', OTHER: 'Other',
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface IncomeStatsProps {
  month: string
}

export function IncomeStats({ month }: IncomeStatsProps) {
  const { data: curr } = useIncomeSummary(month)
  const { data: prev } = useIncomeSummary(shiftMonth(month, -1))

  const monthlyTotal = toRupees(curr?.monthlyTotal ?? 0)
  const ytdTotal = toRupees(curr?.ytdTotal ?? 0)
  const prevTotal = toRupees(prev?.monthlyTotal ?? 0)

  const momPct = prevTotal > 0 ? ((monthlyTotal - prevTotal) / prevTotal) * 100 : null
  const momUp = momPct !== null && momPct >= 0

  const top = curr?.byCategory?.reduce<{ category: IncomeCategory; totalPaise: number } | null>(
    (max, c) => (!max || c.totalPaise > max.totalPaise ? c : max),
    null,
  )
  const primaryPct = top && curr?.monthlyTotal
    ? Math.round((top.totalPaise / curr.monthlyTotal) * 100)
    : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Monthly Total"
        value={formatRupeesCompact(monthlyTotal)}
        icon={<IndianRupee size={15} />}
        colorClass="text-theme-primary"
      />
      <StatCard
        label="YTD Total"
        value={formatRupeesCompact(ytdTotal)}
        icon={<CalendarDays size={15} />}
        colorClass="text-theme-text-sec"
      />
      <StatCard
        label="Primary Source"
        value={top ? `${CATEGORY_LABELS[top.category]} ${primaryPct}%` : '—'}
        icon={<Award size={15} />}
        colorClass="text-amber-500"
      />
      <StatCard
        label="MoM Change"
        value={momPct !== null ? `${momUp ? '+' : ''}${momPct.toFixed(1)}%` : '—'}
        icon={
          momPct === null ? <Minus size={15} /> :
          momUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />
        }
        colorClass={momPct === null ? 'text-theme-muted' : momUp ? 'text-green-600' : 'text-red-500'}
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  colorClass: string
}

function StatCard({ label, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex flex-col gap-2">
      <div className={`flex items-center gap-1.5 ${colorClass}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-theme-text leading-tight truncate">{value}</p>
    </div>
  )
}
