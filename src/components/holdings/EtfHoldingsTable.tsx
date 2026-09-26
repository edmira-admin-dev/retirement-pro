import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Layers } from 'lucide-react'
import type { ParsedEquityHolding } from '../../hooks/useEquityHoldings'

interface Props {
  holdings: ParsedEquityHolding[]
  portfolioPct: number
}

type SortKey = 'symbol' | 'ltp' | 'dayChangePct' | 'quantity' | 'avgCost' | 'weight' | 'invested' | 'current' | 'pnl'
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

function ChangeCell ({ pct }: { pct: number }) {
  if (pct === 0) return <span className="text-theme-muted">—</span>
  const up = pct > 0
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(pct).toFixed(2)}%
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

// ETFs get their own weight-within-ETFs figure (recomputed here, ignoring the
// stock-portfolio weight the holding may carry) since they're kept out of the
// direct-stock table and its benchmark comparison entirely.
export function EtfHoldingsTable ({ holdings, portfolioPct }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('weight')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (holdings.length === 0) return null

  function toggleSort (col: SortKey) {
    if (sortKey === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(col); setSortDir('desc') }
  }

  function rowSortValue (h: ParsedEquityHolding): number | string {
    switch (sortKey) {
      case 'symbol':       return h.symbol.toLowerCase()
      case 'ltp':          return h.ltp
      case 'dayChangePct': return h.dayChangePct
      case 'quantity':     return h.quantity
      case 'avgCost':      return h.avgCost
      case 'weight':       return h.portfolioWeightPct
      case 'invested':     return h.investedValue
      case 'current':      return h.currentValue
      case 'pnl':          return h.pnl
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
        <Layers size={14} className="text-theme-muted" />
        ETF Holdings
        <span className="text-theme-muted font-normal text-xs">· {portfolioPct.toFixed(2)}% of portfolio</span>
      </h2>

      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-xs min-w-[720px]">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-2.5 py-2 text-left font-medium text-theme-muted text-xs">Name</th>
              <SortableTh label="LTP" col="ltp" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="1D change" col="dayChangePct" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Qty" col="quantity" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Avg Buy Price" col="avgCost" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Invested" col="invested" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current Value" col="current" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="ETF Weight" col="weight" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="P&L" col="pnl" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {sorted.map(h => {
              return (
                <tr key={h.symbol} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                  <td className="px-2.5 py-1.5">
                    <p className="font-semibold text-theme-text leading-tight text-xs">{h.companyName}</p>
                    <p className="text-[11px] text-theme-muted mt-0.5">{h.symbol}</p>
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.ltp)}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums"><ChangeCell pct={h.dayChangePct} /></td>
                  <td className="px-2.5 py-1.5 text-right font-medium text-theme-text tabular-nums">{h.quantity}</td>
                  <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.avgCost)}</td>
                  <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtCompact(h.investedValue)}</td>
                  <td className="px-2.5 py-1.5 text-right font-medium text-theme-text tabular-nums">{fmtCompact(h.currentValue)}</td>
                  <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{h.portfolioWeightPct.toFixed(2)}%</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums"><PnlCell amount={h.pnl} pct={h.pnlPct} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
