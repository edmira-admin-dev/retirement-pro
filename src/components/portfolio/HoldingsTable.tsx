import { useState } from 'react'
import { Pencil, Trash2, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { AssetClassBadge } from './AssetClassBadge'
import { useDeleteHolding } from '../../hooks/useHoldings'
import { usePortfolioUIStore } from '../../stores/portfolioUIStore'
import { formatRupees } from '../../utils/money'
import type { Holding } from '../../types/holdings'

interface RowProps {
  holding: Holding
  total: number
}

function HoldingRow({ holding, total }: RowProps) {
  const { mutate: deleteHolding, isPending: deleting } = useDeleteHolding()
  const openEdit = usePortfolioUIStore((s) => s.openEdit)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pnl = holding.currentValue - holding.investedValue
  const pnlPct = holding.investedValue > 0 ? (pnl / holding.investedValue) * 100 : 0
  const isGain = pnl >= 0
  const weight = total > 0 ? (holding.currentValue / total) * 100 : 0
  const avgPrice =
    holding.units && holding.units > 0 ? holding.investedValue / holding.units : null

  return (
    <>
      <tr className="border-b border-theme-border hover:bg-theme-bg-alt/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-sm font-medium text-theme-text leading-tight">{holding.name}</span>
            <AssetClassBadge assetClass={holding.assetClass} />
          </div>
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm text-theme-text whitespace-nowrap">
          {holding.nav != null ? formatRupees(holding.nav) : '—'}
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm text-theme-text whitespace-nowrap">
          {holding.units != null ? holding.units.toLocaleString('en-IN') : '—'}
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm text-theme-text whitespace-nowrap">
          {avgPrice != null ? formatRupees(avgPrice) : '—'}
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm text-theme-muted whitespace-nowrap">
          {formatRupees(holding.investedValue)}
        </td>
        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-theme-text whitespace-nowrap">
          {formatRupees(holding.currentValue)}
        </td>
        <td className="px-4 py-3 text-right text-sm text-theme-muted whitespace-nowrap">
          {weight.toFixed(1)}%
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <div className={`text-sm font-semibold font-mono ${isGain ? 'text-success' : 'text-danger'}`}>
            {isGain ? '+' : ''}{formatRupees(pnl)}
          </div>
          <div className={`text-xs ${isGain ? 'text-success' : 'text-danger'}`}>
            {isGain ? '+' : ''}{pnlPct.toFixed(2)}%
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => openEdit(holding.id)}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              aria-label={`Edit ${holding.name}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-theme-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              aria-label={`Delete ${holding.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {confirmDelete && (
        <tr className="border-b border-theme-border bg-danger/5">
          <td colSpan={9} className="px-4 py-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <p className="text-xs text-theme-muted flex-1">Remove {holding.name}?</p>
              <button
                onClick={() => { deleteHolding(holding.id); setConfirmDelete(false) }}
                disabled={deleting}
                className="text-xs px-3 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? '…' : 'Remove'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-3 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

type SortKey = 'name' | 'invested' | 'current' | 'weight' | 'pnl' | 'pnlPct'
type SortDir = 'asc' | 'desc'

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
      className={`px-4 py-3 text-${align} text-xs font-semibold text-theme-muted uppercase tracking-wide cursor-pointer select-none hover:text-theme-text transition-colors group whitespace-nowrap`}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {align === 'left' && <Icon size={12} className={active ? 'text-theme-primary' : 'opacity-0 group-hover:opacity-50'} />}
        {label}
        {align === 'right' && <Icon size={12} className={active ? 'text-theme-primary' : 'opacity-0 group-hover:opacity-50'} />}
      </span>
    </th>
  )
}

interface HoldingsTableProps {
  holdings: Holding[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('current')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('desc')
    }
  }

  const total = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0)
  const totalPnl = total - totalInvested
  const isGain = totalPnl >= 0

  const sorted = [...holdings].sort((a, b) => {
    let av: number | string = 0
    let bv: number | string = 0
    switch (sortKey) {
      case 'name':    av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break
      case 'invested': av = a.investedValue;      bv = b.investedValue;      break
      case 'current':  av = a.currentValue;       bv = b.currentValue;       break
      case 'weight':   av = a.currentValue;        bv = b.currentValue;       break
      case 'pnl':      av = a.currentValue - a.investedValue; bv = b.currentValue - b.investedValue; break
      case 'pnlPct':
        av = a.investedValue > 0 ? (a.currentValue - a.investedValue) / a.investedValue : 0
        bv = b.investedValue > 0 ? (b.currentValue - b.investedValue) / b.investedValue : 0
        break
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-theme-border bg-theme-bg-alt">
              <SortableTh label="Name"     col="name"     align="left"  sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right text-xs font-semibold text-theme-muted uppercase tracking-wide whitespace-nowrap">LTP</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-theme-muted uppercase tracking-wide whitespace-nowrap">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-theme-muted uppercase tracking-wide whitespace-nowrap">Avg Price</th>
              <SortableTh label="Invested" col="invested"              sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Current"  col="current"               sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Weight"   col="weight"                sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="P&L"      col="pnl"                   sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => (
              <HoldingRow key={h.id} holding={h} total={total} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-theme-border bg-theme-bg-alt">
              <td className="px-4 py-3 text-sm font-semibold text-theme-text" colSpan={4}>
                Total · {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">
                {formatRupees(totalInvested)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text font-mono">
                {formatRupees(total)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-theme-text">100%</td>
              <td className="px-4 py-3 text-right">
                <div className={`text-sm font-semibold font-mono ${isGain ? 'text-success' : 'text-danger'}`}>
                  {isGain ? '+' : ''}{formatRupees(totalPnl)}
                </div>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
