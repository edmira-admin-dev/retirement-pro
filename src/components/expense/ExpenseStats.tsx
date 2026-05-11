import { Home, ShoppingCart, CreditCard, IndianRupee } from 'lucide-react'
import { useExpenseSummary } from '../../hooks/useExpenses'
import { formatRupeesCompact, toRupees } from '../../utils/money'

interface ExpenseStatsProps {
  month: string
}

export function ExpenseStats({ month }: ExpenseStatsProps) {
  const { data: summary } = useExpenseSummary(month)

  const total = toRupees((summary?.byType.FIXED ?? 0) + (summary?.byType.DISCRETIONARY ?? 0) + (summary?.byType.LOAN ?? 0))
  const fixed = toRupees(summary?.byType.FIXED ?? 0)
  const disc = toRupees(summary?.byType.DISCRETIONARY ?? 0)
  const loan = toRupees(summary?.byType.LOAN ?? 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total Expenses" value={formatRupeesCompact(total)} icon={<IndianRupee size={15} />} colorClass="text-red-500" />
      <StatCard label="Fixed" value={formatRupeesCompact(fixed)} icon={<Home size={15} />} colorClass="text-blue-600" />
      <StatCard label="Discretionary" value={formatRupeesCompact(disc)} icon={<ShoppingCart size={15} />} colorClass="text-amber-500" />
      <StatCard label="Loan EMIs" value={formatRupeesCompact(loan)} icon={<CreditCard size={15} />} colorClass="text-purple-600" />
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
