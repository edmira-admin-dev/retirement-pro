import { useState } from 'react'
import { TrendingUp, TrendingDown, Layers, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Holding } from '../../types/holdings'

interface Props {
  holdings: Holding[]
}

type SortKey = 'name' | 'qty' | 'invested' | 'current' | 'pnl' | 'pnlPct'
type SortDir = 'asc' | 'desc'

const SOURCE_COLORS: Record<string, string> = {
  GROWW: 'bg-[#00d09c]/10 text-[#007a5e]',
  KITE: 'bg-blue-50 text-blue-700',
}

function fmtPrice(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pnlColor(n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function fmtPnl(n: number) {
  const prefix = n >= 0 ? '+' : ''
  return `${prefix}₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function parseNotes(notes?: string): { source?: string; exchange?: string } {
  if (!notes) return {}
  try { return JSON.parse(notes) } catch { return {} }
}

interface SortableThProps {
  label: string
  col: SortKey
  align?: 'left' | 'right'
  sortKey: SortKey
  sortDir: SortDir
  onSort: (col: SortKey) => void
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

export function StockHoldingsTable({ holdings }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('current')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <Layers size={32} className="text-theme-muted opacity-40" />
        <p className="text-theme-muted text-sm">No stock holdings yet — sync from Broker Hub or add manually</p>
      </div>
    )
  }

  function toggleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('desc')
    }
  }

  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalPnl = totalCurrent - totalInvested

  const sorted = [...holdings].sort((a, b) => {
    const aPnl = a.currentValue - a.investedValue
    const bPnl = b.currentValue - b.investedValue
    let av: number | string = 0
    let bv: number | string = 0
    switch (sortKey) {
      case 'name':    av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break
      case 'qty':     av = a.units ?? 0;          bv = b.units ?? 0;         break
      case 'invested': av = a.investedValue;       bv = b.investedValue;      break
      case 'current': av = a.currentValue;         bv = b.currentValue;       break
      case 'pnl':     av = aPnl;                   bv = bPnl;                 break
      case 'pnlPct':
        av = a.investedValue > 0 ? aPnl / a.investedValue : 0
        bv = b.investedValue > 0 ? bPnl / b.investedValue : 0
        break
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

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
              {totalPnl >= 0 ? '+' : ''}{((totalPnl / totalInvested) * 100).toFixed(2)}%
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-theme-border">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-theme-border bg-theme-bg-alt">
              <SortableTh label="Symbol"   col="name"     align="left"  sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Qty"      col="qty"                    sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right font-semibold text-theme-muted text-xs uppercase tracking-wide whitespace-nowrap">Avg Cost</th>
              <SortableTh label="Invested" col="invested"               sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current"  col="current"                sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="P&L"      col="pnl"                    sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {sorted.map((h) => {
              const { source, exchange } = parseNotes(h.notes)
              const avgCost = h.units && h.units > 0 ? h.investedValue / h.units : 0
              const pnl = h.currentValue - h.investedValue
              const pnlPct = h.investedValue > 0 ? (pnl / h.investedValue) * 100 : 0
              const sourceCls = source ? (SOURCE_COLORS[source] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
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
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${pnlColor(pnl)}`}>{fmtPnl(pnl)}</span>
                    <span className={`block text-xs ${pnlColor(pnl)}`}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-theme-border bg-theme-bg-alt">
              <td className="px-4 py-3 text-xs font-semibold text-theme-muted" colSpan={3}>
                Total · {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">
                {fmtPrice(totalInvested)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">
                {fmtPrice(totalCurrent)}
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`text-sm font-semibold font-mono ${pnlColor(totalPnl)}`}>{fmtPnl(totalPnl)}</span>
                {totalInvested > 0 && (
                  <span className={`block text-xs ${pnlColor(totalPnl)}`}>
                    {totalPnl >= 0 ? '+' : ''}{((totalPnl / totalInvested) * 100).toFixed(2)}%
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
