import { useState } from 'react'
import { TrendingUp, TrendingDown, Layers, ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react'
import type { Holding } from '../../types/holdings'

interface Props {
  holdings: Holding[]
}

type SortKey = 'name' | 'qty' | 'invested' | 'current' | 'pnl' | 'pnlPct'
type SortDir = 'asc' | 'desc'
type GroupBy = 'none' | 'marketCap' | 'sector' | 'country'

const SOURCE_COLORS: Record<string, string> = {
  GROWW: 'bg-[#00d09c]/10 text-[#007a5e]',
  KITE: 'bg-blue-50 text-blue-700',
}

const MARKET_CAP_ORDER = ['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap', 'Unclassified']

function fmtPrice(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function pnlColor(n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function allocDriftColor(current: number, target: number) {
  const diff = current - target
  if (diff > 1) return 'text-amber-600'
  if (diff < -1) return 'text-blue-500'
  return 'text-green-600'
}

function fmtPnl(n: number) {
  const prefix = n >= 0 ? '+' : ''
  return `${prefix}₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function parseNotes(notes?: string): {
  source?: string; exchange?: string
  sector?: string; marketCap?: string; country?: string
} {
  if (!notes) return {}
  try { return JSON.parse(notes) } catch { return {} }
}

function getGroupKey(h: Holding, groupBy: GroupBy): string {
  const { sector, marketCap, country } = parseNotes(h.notes)
  switch (groupBy) {
    case 'sector':    return sector    ?? 'Unknown Sector'
    case 'marketCap': return marketCap ?? 'Unclassified'
    case 'country': {
      if (country) return country
      return (h.assetClass === 'INTL_EQUITY' || h.assetClass === 'INTL_DEBT') ? 'International' : 'India'
    }
    default: return '__all__'
  }
}

function sortGroupKeys(keys: string[], groupBy: GroupBy): string[] {
  if (groupBy === 'marketCap') {
    return [...keys].sort((a, b) => {
      const ai = MARKET_CAP_ORDER.indexOf(a)
      const bi = MARKET_CAP_ORDER.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }
  if (groupBy === 'country') return [...keys].sort((a) => (a === 'India' ? -1 : 1))
  return [...keys].sort((a, b) => a.localeCompare(b))
}

interface SortableThProps {
  label: string; col: SortKey; align?: 'left' | 'right'
  sortKey: SortKey; sortDir: SortDir; onSort: (col: SortKey) => void
}

function SortableTh({ label, col, align = 'right', sortKey, sortDir, onSort }: SortableThProps) {
  const active = sortKey === col
  const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-4 py-3 text-${align} font-semibold text-theme-muted text-xs uppercase tracking-wide cursor-pointer select-none hover:text-theme-text transition-colors group whitespace-nowrap`}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {align === 'left' && <Icon size={12} className={active ? 'text-theme-primary' : 'opacity-0 group-hover:opacity-50'} />}
        {label}
        {align === 'right' && <Icon size={12} className={active ? 'text-theme-primary' : 'opacity-0 group-hover:opacity-50'} />}
      </span>
    </th>
  )
}

interface GroupHeaderRowProps {
  label: string; count: number; collapsed: boolean
  invested: number; current: number; pnl: number
  targetAllocPct: number; currentAllocPct: number
  onToggle: () => void
}

function GroupHeaderRow({ label, count, collapsed, invested, current, pnl, targetAllocPct, currentAllocPct, onToggle }: GroupHeaderRowProps) {
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0
  return (
    <tr
      className="bg-theme-bg-alt border-y border-theme-border cursor-pointer hover:bg-theme-border/20 transition-colors"
      onClick={onToggle}
    >
      <td className="px-4 py-2" colSpan={3}>
        <span className="inline-flex items-center gap-1.5 font-semibold text-theme-text text-xs uppercase tracking-wide">
          <ChevronRight
            size={12}
            className={`text-theme-muted transition-transform ${collapsed ? '' : 'rotate-90'}`}
          />
          {label}
          <span className="text-theme-muted font-normal normal-case tracking-normal ml-1">
            {count} stock{count !== 1 ? 's' : ''}
          </span>
        </span>
      </td>
      <td className="px-4 py-2 text-right text-xs font-semibold text-theme-text font-mono">{fmtPrice(invested)}</td>
      <td className="px-4 py-2 text-right text-xs font-semibold text-theme-text font-mono">{fmtPrice(current)}</td>
      <td className="px-4 py-2 text-right text-xs font-semibold text-theme-muted">{targetAllocPct.toFixed(2)}%</td>
      <td className="px-4 py-2 text-right">
        <span className={`text-xs font-semibold ${allocDriftColor(currentAllocPct, targetAllocPct)}`}>
          {currentAllocPct.toFixed(2)}%
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <span className={`text-xs font-semibold ${pnlColor(pnl)}`}>{fmtPnl(pnl)}</span>
        {invested > 0 && (
          <span className={`block text-xs ${pnlColor(pnl)}`}>{fmtPct(pnlPct)}</span>
        )}
      </td>
    </tr>
  )
}

const GROUP_BY_OPTIONS: { key: GroupBy; label: string }[] = [
  { key: 'none',      label: 'No Group' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'sector',    label: 'Sector' },
  { key: 'country',   label: 'Country' },
]

export function StockHoldingsTable({ holdings }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('current')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <Layers size={32} className="text-theme-muted opacity-40" />
        <p className="text-theme-muted text-sm">No stock holdings yet — upload a tradebook or add manually</p>
      </div>
    )
  }

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(col); setSortDir('desc') }
  }

  function toggleGroup(key: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalCurrent  = holdings.reduce((s, h) => s + h.currentValue,  0)
  const totalPnl      = totalCurrent - totalInvested
  const targetPct     = 5 // fixed 5% per holding

  const sorted = [...holdings].sort((a, b) => {
    const aPnl = a.currentValue - a.investedValue
    const bPnl = b.currentValue - b.investedValue
    let av: number | string = 0, bv: number | string = 0
    switch (sortKey) {
      case 'name':     av = a.name.toLowerCase();  bv = b.name.toLowerCase();  break
      case 'qty':      av = a.units ?? 0;           bv = b.units ?? 0;          break
      case 'invested': av = a.investedValue;        bv = b.investedValue;       break
      case 'current':  av = a.currentValue;         bv = b.currentValue;        break
      case 'pnl':      av = aPnl;                   bv = bPnl;                  break
      case 'pnlPct':
        av = a.investedValue > 0 ? aPnl / a.investedValue : 0
        bv = b.investedValue > 0 ? bPnl / b.investedValue : 0
        break
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  // Build groups map
  const groupMap = new Map<string, Holding[]>()
  for (const h of sorted) {
    const key = getGroupKey(h, groupBy)
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(h)
  }
  const groupKeys = groupBy === 'none' ? ['__all__'] : sortGroupKeys([...groupMap.keys()], groupBy)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Invested</p>
          <p className="text-base font-semibold text-theme-text">{fmtPrice(totalInvested)}</p>
        </div>
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Current</p>
          <p className="text-base font-semibold text-theme-text">{fmtPrice(totalCurrent)}</p>
        </div>
        <div className="bg-theme-card border border-theme-border rounded-xl p-4">
          <p className="text-xs text-theme-muted uppercase tracking-wide mb-1">Total P&L</p>
          <p className={`text-base font-semibold flex items-center gap-1 ${pnlColor(totalPnl)}`}>
            {totalPnl > 0 ? <TrendingUp size={14} /> : totalPnl < 0 ? <TrendingDown size={14} /> : null}
            {fmtPnl(totalPnl)}
          </p>
          {totalInvested > 0 && (
            <p className={`text-xs mt-0.5 ${pnlColor(totalPnl)}`}>
              {fmtPct((totalPnl / totalInvested) * 100)}
            </p>
          )}
        </div>
      </div>

      {/* Group-by controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-theme-muted font-medium uppercase tracking-wide">Group by</span>
        <div className="flex gap-1">
          {GROUP_BY_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setGroupBy(key); setCollapsedGroups(new Set()) }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                groupBy === key
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text border border-theme-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-sm min-w-[960px]">
          <thead>
            <tr className="border-b border-theme-border bg-theme-bg-alt">
              <SortableTh label="Symbol"   col="name"     align="left" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Qty"      col="qty"                   sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide whitespace-nowrap">Avg Cost</th>
              <SortableTh label="Invested" col="invested"              sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current"  col="current"               sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide whitespace-nowrap">Target Alloc%</th>
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide whitespace-nowrap">Current Alloc%</th>
              <SortableTh label="P&L"      col="pnl"                   sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          {groupKeys.map((gk) => {
              const group = groupMap.get(gk) ?? []
              const gInvested     = group.reduce((s, h) => s + h.investedValue, 0)
              const gCurrent      = group.reduce((s, h) => s + h.currentValue,  0)
              const gPnl          = gCurrent - gInvested
              const gTargetAlloc  = group.length * targetPct
              const gCurrentAlloc = totalInvested > 0 ? (gCurrent / totalInvested) * 100 : 0
              const collapsed     = collapsedGroups.has(gk)

              return (
                <tbody key={gk} className="divide-y divide-theme-border">
                  {groupBy !== 'none' && (
                    <GroupHeaderRow
                      label={gk} count={group.length} collapsed={collapsed}
                      invested={gInvested} current={gCurrent} pnl={gPnl}
                      targetAllocPct={gTargetAlloc} currentAllocPct={gCurrentAlloc}
                      onToggle={() => toggleGroup(gk)}
                    />
                  )}
                  {!collapsed && group.map((h) => {
                    const { source, exchange } = parseNotes(h.notes)
                    const avgCost      = h.units && h.units > 0 ? h.investedValue / h.units : 0
                    const pnl          = h.currentValue - h.investedValue
                    const pnlPct       = h.investedValue > 0 ? (pnl / h.investedValue) * 100 : 0
                    const currentAlloc = totalInvested > 0 ? (h.currentValue / totalInvested) * 100 : 0
                    const sourceCls    = source ? (SOURCE_COLORS[source] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
                    return (
                      <tr key={h.id} className="bg-theme-card hover:bg-theme-bg-alt transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-theme-text">{h.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {exchange && (
                              <span className="text-xs text-theme-muted bg-theme-bg-alt px-1.5 py-0.5 rounded">{exchange}</span>
                            )}
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sourceCls}`}>
                              {source ?? 'Manual'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-theme-text">
                          {h.units != null ? h.units : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-theme-text">
                          {avgCost > 0 ? fmtPrice(avgCost) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-theme-muted font-mono">
                          {fmtPrice(h.investedValue)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-theme-text font-mono">
                          {fmtPrice(h.currentValue)}
                        </td>
                        <td className="px-4 py-3 text-right text-theme-muted text-xs">
                          {targetPct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-semibold ${allocDriftColor(currentAlloc, targetPct)}`}>
                            {currentAlloc.toFixed(2)}%
                          </span>
                          <span className={`block text-xs ${allocDriftColor(currentAlloc, targetPct)}`}>
                            {currentAlloc >= targetPct ? '+' : ''}{(currentAlloc - targetPct).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${pnlColor(pnl)}`}>{fmtPnl(pnl)}</span>
                          <span className={`block text-xs ${pnlColor(pnl)}`}>
                            {fmtPct(pnlPct)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              )
            })}
          <tfoot>
            <tr className="border-t-2 border-theme-border bg-theme-bg-alt">
              <td className="px-4 py-3 text-xs font-semibold text-theme-muted" colSpan={3}>
                Total · {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">{fmtPrice(totalInvested)}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">{fmtPrice(totalCurrent)}</td>
              <td className="px-4 py-3 text-right text-xs font-semibold text-theme-muted">
                {(holdings.length * targetPct).toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-right text-xs font-semibold text-theme-muted">
                {totalInvested > 0 ? ((totalCurrent / totalInvested) * 100).toFixed(2) : '0.00'}%
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`text-sm font-semibold font-mono ${pnlColor(totalPnl)}`}>{fmtPnl(totalPnl)}</span>
                {totalInvested > 0 && (
                  <span className={`block text-xs ${pnlColor(totalPnl)}`}>
                    {fmtPct((totalPnl / totalInvested) * 100)}
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
