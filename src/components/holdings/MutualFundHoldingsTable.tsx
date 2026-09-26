import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, PiggyBank } from 'lucide-react'
import type { MutualFundHolding } from '../../hooks/useMutualFundHoldings'

interface Props {
  holdings: MutualFundHolding[]
  portfolioPct: number
}

type SortKey = 'fundName' | 'nav' | 'units' | 'invested' | 'current' | 'weight' | 'pnl' | 'xirr'
type SortDir = 'asc' | 'desc'

function fmtCompact (n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(2)}K`
  return `${sign}${abs.toFixed(2)}`
}

function fmtPlain (n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pnlColor (n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function PnlCell ({ amount, pct }: { amount: number; pct: number }) {
  return (
    <span className={`font-medium ${pnlColor(amount)}`}>
      {amount >= 0 ? '+' : '-'}{fmtCompact(Math.abs(amount))} ({Math.abs(pct).toFixed(2)}%)
    </span>
  )
}

interface SortableThProps {
  label: string; col: SortKey
  sortKey: SortKey; sortDir: SortDir; onSort: (col: SortKey) => void
}

function SortableTh ({ label, col, sortKey, sortDir, onSort }: SortableThProps) {
  const active = sortKey === col
  const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <th
      onClick={() => onSort(col)}
      className="px-2.5 py-2 text-right font-medium text-theme-muted text-xs cursor-pointer select-none hover:text-theme-text transition-colors group whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1 justify-end">
        <Icon size={12} className={active ? 'text-theme-primary' : 'opacity-0 group-hover:opacity-50'} />
        {label}
      </span>
    </th>
  )
}

export function MutualFundHoldingsTable ({ holdings, portfolioPct }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('current')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (holdings.length === 0) return null

  function toggleSort (col: SortKey) {
    if (sortKey === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(col); setSortDir('desc') }
  }

  function rowSortValue (h: MutualFundHolding): number | string {
    switch (sortKey) {
      case 'fundName': return h.fundName.toLowerCase()
      case 'nav':      return h.nav
      case 'units':    return h.units
      case 'invested': return h.investedValue
      case 'current':  return h.currentValue
      case 'weight':   return h.weightPct
      case 'pnl':      return h.pnl
      case 'xirr':     return h.xirrPct
    }
  }

  const sorted = [...holdings].sort((a, b) => {
    const av = rowSortValue(a), bv = rowSortValue(b)
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
        <PiggyBank size={14} className="text-theme-muted" />
        Mutual Fund Holdings
        <span className="text-theme-muted font-normal text-xs">· {portfolioPct.toFixed(2)}% of portfolio</span>
      </h2>

      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-2.5 py-2 text-left font-medium text-theme-muted text-xs">Fund</th>
              <SortableTh label="NAV" col="nav" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Units" col="units" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Invested" col="invested" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current Value" col="current" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Weight" col="weight" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="P&L" col="pnl" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="XIRR" col="xirr" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {sorted.map(h => (
              <tr key={h.id} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                <td className="px-2.5 py-1.5">
                  <p className="font-semibold text-theme-text leading-tight text-xs">{h.fundName}</p>
                  <p className="text-[11px] text-theme-muted mt-0.5">{h.amcName} · {h.category}</p>
                </td>
                <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.nav)}</td>
                <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.units)}</td>
                <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtCompact(h.investedValue)}</td>
                <td className="px-2.5 py-1.5 text-right font-medium text-theme-text tabular-nums">{fmtCompact(h.currentValue)}</td>
                <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{h.weightPct.toFixed(2)}%</td>
                <td className="px-2.5 py-1.5 text-right tabular-nums"><PnlCell amount={h.pnl} pct={h.pnlPct} /></td>
                <td className={`px-2.5 py-1.5 text-right font-medium tabular-nums ${pnlColor(h.xirrPct)}`}>{h.xirrPct.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
