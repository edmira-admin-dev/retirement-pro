import { useState } from 'react'
import { Landmark, ScrollText, TrendingUp, Gem, Building2, Globe, Briefcase, Package, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { HoldingCard } from './HoldingCard'
import { NetWorthSummary } from './NetWorthSummary'
import { usePortfolioUIStore } from '../../stores/portfolioUIStore'
import { formatRupeesCompact } from '../../utils/money'
import type { Holding, AssetClass } from '../../types/holdings'

interface AssetGroup {
  id: string
  label: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
  classes: AssetClass[]
}

const GROUPS: AssetGroup[] = [
  { id: 'cash',       label: 'Cash & Savings',   icon: Landmark,    colorClass: 'text-sky-600',    bgClass: 'bg-sky-500/10',    classes: ['BANK', 'LIQUID'] },
  { id: 'fixed',      label: 'Fixed Income',     icon: ScrollText,  colorClass: 'text-amber-600',  bgClass: 'bg-amber-500/10',  classes: ['FD', 'BOND'] },
  { id: 'equity',     label: 'Equity',           icon: TrendingUp,  colorClass: 'text-emerald-600', bgClass: 'bg-emerald-500/10', classes: ['STOCK', 'ETF', 'MF'] },
  { id: 'retirement', label: 'Retirement',       icon: Briefcase,   colorClass: 'text-purple-600', bgClass: 'bg-purple-500/10', classes: ['NPS', 'EPF', 'PPF', 'ANNUITY'] },
  { id: 'bullions',   label: 'Bullions',         icon: Gem,         colorClass: 'text-yellow-600', bgClass: 'bg-yellow-500/10', classes: ['GOLD'] },
  { id: 'real',       label: 'Real Estate',      icon: Building2,   colorClass: 'text-rose-600',   bgClass: 'bg-rose-500/10',   classes: ['REAL_ESTATE'] },
  { id: 'global',     label: 'Global',           icon: Globe,       colorClass: 'text-indigo-600', bgClass: 'bg-indigo-500/10', classes: ['INTL_EQUITY', 'INTL_DEBT'] },
  { id: 'commodities', label: 'Commodities',     icon: Package,     colorClass: 'text-orange-600', bgClass: 'bg-orange-500/10', classes: ['COMMODITY'] },
]

interface GroupSectionProps {
  group: AssetGroup
  holdings: Holding[]
}

function GroupSection({ group, holdings }: GroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const openQuickAdd = usePortfolioUIStore((s) => s.openQuickAdd)
  const total = holdings.reduce((s, h) => s + h.currentValue, 0)
  const invested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const gain = total - invested
  const isGain = gain >= 0
  const isCashGroup = group.id === 'cash'
  const Icon = group.icon

  if (holdings.length === 0) return null

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-theme-bg-alt transition-colors cursor-pointer"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${group.bgClass} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={group.colorClass} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-theme-text">{group.label}</p>
            <p className="text-xs text-theme-muted">{holdings.length} holding{holdings.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-theme-text font-mono">{formatRupeesCompact(total)}</p>
            {!isCashGroup && (
              <p className={`text-xs font-medium ${isGain ? 'text-success' : 'text-danger'}`}>
                {isGain ? '+' : ''}{formatRupeesCompact(gain)}
              </p>
            )}
          </div>
          {collapsed ? <ChevronDown size={16} className="text-theme-muted" /> : <ChevronUp size={16} className="text-theme-muted" />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-theme-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {holdings.map((h) => <HoldingCard key={h.id} holding={h} />)}
            <button
              onClick={() => openQuickAdd(group.id)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-theme-border hover:border-theme-primary text-theme-muted hover:text-theme-primary transition-colors cursor-pointer min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              aria-label={`Add ${group.label} holding`}
            >
              <Plus size={18} />
              <span className="text-xs font-medium">Add {group.label}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface PortfolioDashboardProps {
  holdings: Holding[]
}

export function PortfolioDashboard({ holdings }: PortfolioDashboardProps) {
  const openQuickAdd = usePortfolioUIStore((s) => s.openQuickAdd)
  const grouped = GROUPS.map((g) => ({
    group: g,
    holdings: holdings.filter((h) => (g.classes as string[]).includes(h.assetClass)),
  }))
  const populated = grouped.filter((g) => g.holdings.length > 0)
  const unpopulated = grouped.filter((g) => g.holdings.length === 0)

  return (
    <div className="space-y-4">
      <NetWorthSummary holdings={holdings} />

      {populated.map(({ group, holdings: gh }) => (
        <GroupSection key={group.id} group={group} holdings={gh} />
      ))}

      {unpopulated.length > 0 && (
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3">Not started yet</p>
          <div className="flex flex-wrap gap-2">
            {unpopulated.map(({ group }) => {
              const Icon = group.icon
              return (
                <button
                  key={group.id}
                  onClick={() => openQuickAdd(group.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${group.bgClass} ${group.colorClass} text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary`}
                >
                  <Icon size={13} />
                  {group.label}
                  <Plus size={11} />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
