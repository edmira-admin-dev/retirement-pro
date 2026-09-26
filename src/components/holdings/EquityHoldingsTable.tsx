import { useState } from 'react'
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Layers, Landmark, Cpu, Car,
  ShoppingCart, Boxes, HeartPulse, Factory, Zap, Radio, HelpCircle, Wrench, Building2,
  FlaskConical, HardHat, Sofa, Fuel, Shirt,
} from 'lucide-react'
import type { ParsedEquityHolding } from '../../hooks/useEquityHoldings'
import { useIndices, useIndexSectorAllocation, type IndexKey } from '../../hooks/useMarket'

export type WeightBasis = 'current' | 'invested'

interface Props {
  holdings: ParsedEquityHolding[]
  portfolioPct: number
  weightBasis: WeightBasis
  onWeightBasisChange: (basis: WeightBasis) => void
}

type SortKey = 'symbol' | 'ltp' | 'dayChangePct' | 'quantity' | 'avgCost' | 'weight' | 'invested' | 'current' | 'pnl'
type SortDir = 'asc' | 'desc'
type GroupBy = 'none' | 'sector' | 'industry'

const SECTOR_ICONS: Record<string, typeof Landmark> = {
  'Financial Services': Landmark,
  'Information Technology': Cpu,
  'Automobile and Auto Components': Car,
  'Fast Moving Consumer Goods': ShoppingCart,
  'Metals & Mining': Boxes,
  Healthcare: HeartPulse,
  'Capital Goods': Wrench,
  Services: Factory,
  'Consumer Services': Factory,
  'Oil Gas & Consumable Fuels': Fuel,
  Power: Zap,
  Telecommunication: Radio,
  'Media Entertainment & Publication': Radio,
  Chemicals: FlaskConical,
  Construction: HardHat,
  'Construction Materials': HardHat,
  'Consumer Durables': Sofa,
  Realty: Building2,
  Textiles: Shirt,
  Diversified: Building2,
  ETF: Layers,
  Uncategorized: HelpCircle,
}

function GroupIcon ({ label }: { label: string }) {
  const Icon = SECTOR_ICONS[label] ?? Building2
  return (
    <div className="w-6 h-6 rounded-md bg-theme-bg-alt flex items-center justify-center shrink-0">
      <Icon size={13} className="text-theme-muted" />
    </div>
  )
}

// ── Formatters ────────────────────────────────────────────────────────────────

// ₹ compact: 100000+ → "1.25L", 1000+ → "1.25K", else plain
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

// ── Sortable header ───────────────────────────────────────────────────────────

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

// ── Group header row ──────────────────────────────────────────────────────────

function GroupHeaderRow ({ label, count, invested, current, weightPct, indexWeightPct, showIndexCol, expanded, onToggle }: {
  label: string; count: number; invested: number; current: number; weightPct: number
  indexWeightPct?: number; showIndexCol: boolean; expanded: boolean; onToggle: () => void
}) {
  const pnl = current - invested
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
  return (
    <tr className="bg-theme-bg-alt border-y border-theme-border cursor-pointer hover:bg-theme-border/20 transition-colors" onClick={onToggle}>
      <td className="px-2.5 py-2" colSpan={5}>
        <span className="inline-flex items-center gap-2 font-semibold text-theme-text text-sm">
          <GroupIcon label={label} />
          {label}
          <span className="text-theme-muted font-normal text-xs">{count} stock{count !== 1 ? 's' : ''}</span>
        </span>
      </td>
      <td className="px-2.5 py-2 text-right text-sm font-medium text-theme-text">{fmtCompact(invested)}</td>
      <td className="px-2.5 py-2 text-right text-sm font-medium text-theme-text">{fmtCompact(current)}</td>
      <td className="px-2.5 py-2 text-right text-sm font-semibold text-theme-text">{weightPct.toFixed(2)}%</td>
      {showIndexCol && (
        <td className="px-2.5 py-2 text-right text-sm font-medium text-theme-muted">
          {indexWeightPct !== undefined ? `${indexWeightPct.toFixed(2)}%` : '—'}
        </td>
      )}
      <td className="px-2.5 py-2 text-right">
        <PnlCell amount={pnl} pct={pnlPct} />
      </td>
      <td className="px-2 py-2 text-center text-theme-muted">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </td>
    </tr>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────

export function EquityHoldingsTable ({ holdings, portfolioPct, weightBasis, onWeightBasisChange }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('weight')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('sector')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [benchmarkIndex, setBenchmarkIndex] = useState<IndexKey | ''>('')

  const indicesQuery = useIndices()
  const indexAllocationQuery = useIndexSectorAllocation(benchmarkIndex || undefined)
  const indexWeightBySector = new Map<string, number>(
    (indexAllocationQuery.data?.sectors ?? []).map(s => [s.sector, s.weightPct])
  )
  const showIndexCol = groupBy === 'sector' && !!benchmarkIndex

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <Layers size={32} className="text-theme-muted opacity-40" />
        <p className="text-theme-muted text-sm">No equity holdings yet — upload a Tickertape holdings CSV above</p>
      </div>
    )
  }

  function toggleSort (col: SortKey) {
    if (sortKey === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(col); setSortDir('desc') }
  }

  function toggleGroup (key: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const expandAll = () => setCollapsedGroups(new Set())
  const collapseAll = () => setCollapsedGroups(new Set(groupKeysOf(holdings, groupBy)))
  const allExpanded = collapsedGroups.size === 0

  function groupKeysOf (rows: ParsedEquityHolding[], gb: GroupBy): string[] {
    if (gb === 'none') return []
    const keys = new Set(rows.map(h => (gb === 'sector' ? h.sector : h.industry)))
    return [...keys]
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

  const groupMap = new Map<string, ParsedEquityHolding[]>()
  for (const h of sorted) {
    const key = groupBy === 'none' ? '__all__' : groupBy === 'sector' ? h.sector : h.industry
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(h)
  }

  // Group ordering follows the same column/direction as the row-level sort —
  // sums for absolute figures, quantity-weighted averages for per-share prices.
  function groupSortValue (label: string, group: ParsedEquityHolding[]): number | string {
    const sumQty = group.reduce((s, h) => s + h.quantity, 0)
    const sumCurrent = group.reduce((s, h) => s + h.currentValue, 0)
    switch (sortKey) {
      case 'symbol':       return label.toLowerCase()
      case 'ltp':          return sumQty > 0 ? group.reduce((s, h) => s + h.ltp * h.quantity, 0) / sumQty : 0
      case 'avgCost':      return sumQty > 0 ? group.reduce((s, h) => s + h.avgCost * h.quantity, 0) / sumQty : 0
      case 'dayChangePct': return sumCurrent > 0 ? group.reduce((s, h) => s + h.dayChangePct * h.currentValue, 0) / sumCurrent : 0
      case 'quantity':     return sumQty
      case 'weight':       return group.reduce((s, h) => s + h.portfolioWeightPct, 0)
      case 'invested':     return group.reduce((s, h) => s + h.investedValue, 0)
      case 'current':      return sumCurrent
      case 'pnl':          return group.reduce((s, h) => s + h.pnl, 0)
    }
  }

  const allGroupKeys = new Set(groupMap.keys())
  if (showIndexCol) {
    for (const sector of indexWeightBySector.keys()) {
      if (!allGroupKeys.has(sector)) { allGroupKeys.add(sector); groupMap.set(sector, []) }
    }
  }

  const groupKeys = groupBy === 'none'
    ? ['__all__']
    : [...allGroupKeys].sort((a, b) => {
        const av = groupSortValue(a, groupMap.get(a)!), bv = groupSortValue(b, groupMap.get(b)!)
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-base font-bold text-theme-text">
          Direct Stocks
          <span className="ml-2 text-theme-muted font-normal text-xs">· {portfolioPct.toFixed(2)}% of portfolio</span>
        </h2>
        <div className="flex items-center gap-5">
          <div className="inline-flex rounded-lg border border-theme-border overflow-hidden text-xs">
            {(['current', 'invested'] as const).map(basis => (
              <button
                key={basis}
                type="button"
                onClick={() => onWeightBasisChange(basis)}
                className={`px-2.5 py-1.5 font-medium cursor-pointer transition-colors ${
                  weightBasis === basis
                    ? 'bg-theme-primary text-white'
                    : 'bg-theme-card text-theme-muted hover:text-theme-text'
                }`}
              >
                {basis === 'current' ? 'Current Value' : 'Invested Value'}
              </button>
            ))}
          </div>
          {groupBy !== 'none' && (
            <label className="flex items-center gap-2.5 text-xs text-theme-muted cursor-pointer">
              Expand all
              <button
                type="button"
                onClick={allExpanded ? collapseAll : expandAll}
                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${allExpanded ? 'bg-theme-primary' : 'bg-theme-border'}`}
                aria-label="Toggle expand all"
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${allExpanded ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </label>
          )}
          <select
            value={groupBy}
            onChange={e => { setGroupBy(e.target.value as GroupBy); setCollapsedGroups(new Set()) }}
            className="text-xs font-medium border border-theme-border rounded-lg px-3 py-1.5 bg-theme-card text-theme-text cursor-pointer"
          >
            <option value="none">Group by: All</option>
            <option value="sector">Group by: Sector</option>
            <option value="industry">Group by: Industry</option>
          </select>
          <select
            value={benchmarkIndex}
            onChange={e => setBenchmarkIndex(e.target.value as IndexKey | '')}
            className="text-xs font-medium border border-theme-border rounded-lg px-3 py-1.5 bg-theme-card text-theme-text cursor-pointer"
          >
            <option value="">Benchmark: None</option>
            {indicesQuery.data?.map(idx => (
              <option key={idx.key} value={idx.key}>Benchmark: {idx.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="px-2.5 py-2 text-left font-medium text-theme-muted text-xs">Name</th>
              <SortableTh label="LTP" col="ltp" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="1D change" col="dayChangePct" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Qty" col="quantity" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Avg Buy Price" col="avgCost" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Invested" col="invested" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current Value" col="current" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Weight" col="weight" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              {showIndexCol && (
                <th className="px-2.5 py-2 text-right font-medium text-theme-muted text-xs whitespace-nowrap">
                  {indexAllocationQuery.data?.label ?? 'Index'} Weight
                </th>
              )}
              <SortableTh label="P&L" col="pnl" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="w-6" />
            </tr>
          </thead>
          {groupKeys.map(gk => {
            const group = groupMap.get(gk) ?? []
            const gInvested = group.reduce((s, h) => s + h.investedValue, 0)
            const gCurrent = group.reduce((s, h) => s + h.currentValue, 0)
            const gWeight = group.reduce((s, h) => s + h.portfolioWeightPct, 0)
            const collapsed = collapsedGroups.has(gk)

            return (
              <tbody key={gk} className="divide-y divide-theme-border">
                {groupBy !== 'none' && (
                  <GroupHeaderRow
                    label={gk} count={group.length}
                    invested={gInvested} current={gCurrent} weightPct={gWeight}
                    indexWeightPct={indexWeightBySector.get(gk)} showIndexCol={showIndexCol}
                    expanded={!collapsed} onToggle={() => toggleGroup(gk)}
                  />
                )}
                {!collapsed && group.map(h => (
                  <tr key={h.symbol} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                    <td className="px-2.5 py-1.5">
                      <p className="font-semibold text-theme-text leading-tight text-xs">{h.companyName}</p>
                      <p className="text-[11px] text-theme-muted mt-0.5">{h.symbol} <span className="ml-1.5">{h.subSector}</span></p>
                    </td>
                    <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.ltp)}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums"><ChangeCell pct={h.dayChangePct} /></td>
                    <td className="px-2.5 py-1.5 text-right font-medium text-theme-text tabular-nums">{h.quantity}</td>
                    <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtPlain(h.avgCost)}</td>
                    <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{fmtCompact(h.investedValue)}</td>
                    <td className="px-2.5 py-1.5 text-right font-medium text-theme-text tabular-nums">{fmtCompact(h.currentValue)}</td>
                    <td className="px-2.5 py-1.5 text-right text-theme-text tabular-nums">{h.portfolioWeightPct.toFixed(2)}%</td>
                    {showIndexCol && <td className="px-2.5 py-1.5 text-right text-theme-muted tabular-nums">—</td>}
                    <td className="px-2.5 py-1.5 text-right tabular-nums"><PnlCell amount={h.pnl} pct={h.pnlPct} /></td>
                    <td />
                  </tr>
                ))}
              </tbody>
            )
          })}
        </table>
      </div>
    </div>
  )
}
