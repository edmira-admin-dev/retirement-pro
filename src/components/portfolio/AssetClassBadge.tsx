import type { AssetClass } from '../../types/holdings'

interface AssetClassBadgeProps {
  assetClass: AssetClass
}

const CONFIG: Record<AssetClass, { label: string; className: string }> = {
  MF:          { label: 'MF',         className: 'bg-blue-500/15 text-blue-500' },
  NPS:         { label: 'NPS',        className: 'bg-purple-500/15 text-purple-500' },
  EPF:         { label: 'EPF',        className: 'bg-orange-500/15 text-orange-500' },
  PPF:         { label: 'PPF',        className: 'bg-yellow-500/15 text-yellow-600' },
  STOCK:       { label: 'Stock',      className: 'bg-theme-primary/15 text-theme-primary' },
  BANK:        { label: 'Bank',       className: 'bg-sky-500/15 text-sky-600' },
  LIQUID:      { label: 'Liquid',     className: 'bg-teal-500/15 text-teal-600' },
  FD:          { label: 'FD',         className: 'bg-amber-500/15 text-amber-600' },
  BOND:        { label: 'Bond',       className: 'bg-indigo-500/15 text-indigo-600' },
  ETF:         { label: 'ETF',        className: 'bg-cyan-500/15 text-cyan-600' },
  GOLD:        { label: 'Gold',       className: 'bg-yellow-400/15 text-yellow-500' },
  REAL_ESTATE: { label: 'Real Estate',className: 'bg-rose-500/15 text-rose-600' },
  ANNUITY:     { label: 'Annuity',    className: 'bg-violet-500/15 text-violet-600' },
  INTL_EQUITY: { label: 'Intl Equity',className: 'bg-emerald-500/15 text-emerald-600' },
  INTL_DEBT:   { label: 'Intl Debt',  className: 'bg-lime-500/15 text-lime-600' },
  COMMODITY:   { label: 'Commodity',  className: 'bg-orange-500/15 text-orange-600' },
}

export function AssetClassBadge({ assetClass }: AssetClassBadgeProps) {
  const { label, className } = CONFIG[assetClass] ?? { label: assetClass, className: 'bg-theme-border text-theme-muted' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
