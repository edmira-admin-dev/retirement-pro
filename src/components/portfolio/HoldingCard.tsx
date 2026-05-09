import { useState } from 'react'
import { Pencil, Trash2, AlertCircle } from 'lucide-react'
import { AssetClassBadge } from './AssetClassBadge'
import { useDeleteHolding } from '../../hooks/useHoldings'
import { usePortfolioUIStore } from '../../stores/portfolioUIStore'
import { formatRupees, formatRupeesCompact } from '../../utils/money'
import type { Holding } from '../../types/holdings'

interface HoldingCardProps {
  holding: Holding
}

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (diff === 0) return 'Updated today'
  if (diff === 1) return 'Updated yesterday'
  return `Updated ${diff} days ago`
}

type PayoutFreq = 'maturity' | 'quarterly' | 'monthly'

interface BondMeta {
  couponRate?: number
  startDate?: string
  termMonths?: number
  payoutFreq?: PayoutFreq
}

function parseBondNotes(notes?: string): BondMeta | null {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (!p || typeof p !== 'object') return null
    return {
      couponRate: typeof p.r === 'number' ? p.r : undefined,
      startDate: typeof p.startDate === 'string' ? p.startDate : undefined,
      termMonths: typeof p.termMonths === 'number' ? p.termMonths : undefined,
      payoutFreq: p.payoutFreq as PayoutFreq | undefined,
    }
  } catch {
    return null
  }
}

function computeNextPayment(meta: BondMeta): { date: Date; isMaturity: boolean } | null {
  const { startDate, payoutFreq, termMonths } = meta
  if (!startDate || !payoutFreq) return null
  const [rawMm, rawYy] = startDate.split('/')
  const mm = parseInt(rawMm, 10)
  const yy = parseInt(rawYy, 10)
  if (!mm || !yy || mm < 1 || mm > 12) return null
  const start = new Date(2000 + yy, mm - 1, 1)

  if (payoutFreq === 'maturity') {
    if (!termMonths) return null
    const mat = new Date(start)
    mat.setMonth(mat.getMonth() + termMonths)
    return { date: mat, isMaturity: true }
  }

  const period = payoutFreq === 'monthly' ? 1 : 3
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const next = new Date(start)
  while (next < today) next.setMonth(next.getMonth() + period)

  if (termMonths) {
    const mat = new Date(start)
    mat.setMonth(mat.getMonth() + termMonths)
    if (next >= mat) return { date: mat, isMaturity: true }
  }

  return { date: next, isMaturity: false }
}

function periodicCoupon(principal: number, rate: number, freq: PayoutFreq): number {
  if (freq === 'monthly') return (principal * rate) / 100 / 12
  if (freq === 'quarterly') return (principal * rate) / 100 / 4
  return 0
}

function fmtPayDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

function parseCashRate(notes?: string): number | null {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    return typeof p?.r === 'number' ? p.r : null
  } catch {
    return null
  }
}

interface RetirementMeta {
  rate?: number
  age?: number
  yr?: number
}

function parseRetirementNotes(notes?: string): RetirementMeta | null {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (!p || typeof p !== 'object') return null
    return {
      rate: typeof p.r === 'number' ? p.r : undefined,
      age: typeof p.age === 'number' ? p.age : undefined,
      yr: typeof p.yr === 'number' ? p.yr : undefined,
    }
  } catch {
    return null
  }
}

export const HoldingCard = ({ holding }: HoldingCardProps) => {
  const { mutate: deleteHolding, isPending: deleting } = useDeleteHolding()
  const openEdit = usePortfolioUIStore((s) => s.openEdit)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isCash = holding.assetClass === 'BANK' || holding.assetClass === 'LIQUID'
  const isFixedIncome = holding.assetClass === 'BOND' || holding.assetClass === 'FD'
  const isRetirement = ['NPS', 'EPF', 'PPF', 'ANNUITY'].includes(holding.assetClass)
  const isGold = holding.assetClass === 'GOLD'
  const isRealEstate = holding.assetClass === 'REAL_ESTATE'
  const gainPct =
    holding.investedValue > 0
      ? ((holding.currentValue - holding.investedValue) / holding.investedValue) * 100
      : 0
  const isGain = gainPct >= 0

  const cashRate = isCash ? parseCashRate(holding.notes) : null
  const goldRate = isGold ? parseCashRate(holding.notes) : null
  const realEstateRate = isRealEstate ? parseCashRate(holding.notes) : null

  const bondMeta = isFixedIncome ? parseBondNotes(holding.notes) : null
  const nextPayment = bondMeta ? computeNextPayment(bondMeta) : null
  const hasPaymentInfo = nextPayment !== null && bondMeta !== null

  const retMeta = isRetirement ? parseRetirementNotes(holding.notes) : null
  const retProjection = (() => {
    if (!retMeta?.rate || !retMeta?.age || !retMeta?.yr) return null
    const thisYear = new Date().getFullYear()
    const effectiveAge = retMeta.age + (thisYear - retMeta.yr)
    const yearsTo60 = 60 - effectiveAge
    if (yearsTo60 <= 0) return null
    return {
      amount: holding.currentValue * Math.pow(1 + retMeta.rate / 100, yearsTo60),
      yearsTo60,
      rate: retMeta.rate,
    }
  })()

  const actionButtons = (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => openEdit(holding.id)}
        className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
        aria-label={`Edit ${holding.name}`}
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={() => setConfirmDelete(true)}
        className="p-1.5 rounded-lg text-theme-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        aria-label={`Delete ${holding.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )

  if (isRetirement) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AssetClassBadge assetClass={holding.assetClass} />
            <p className="text-sm font-medium text-theme-text truncate">{holding.name}</p>
          </div>
          {actionButtons}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold text-theme-text font-mono">
            {formatRupees(holding.currentValue)}
          </p>
          {retMeta?.rate != null ? (
            <span className="text-sm font-medium text-purple-600 shrink-0">{retMeta.rate}% p.a.</span>
          ) : (
            <span className="text-xs text-theme-muted shrink-0">no rate set</span>
          )}
        </div>

        {retProjection && (
          <div className="flex items-baseline justify-between gap-2 px-2 py-1.5 rounded-lg bg-purple-500/10">
            <p className="text-xs text-theme-muted">Projected at 60 · {retProjection.yearsTo60}y</p>
            <p className="text-sm font-semibold text-purple-700 font-mono shrink-0">
              {formatRupeesCompact(retProjection.amount)}
            </p>
          </div>
        )}

        <p className="text-xs text-theme-muted">{daysAgo(holding.lastUpdated)}</p>

        {confirmDelete && (
          <div className="flex items-center gap-2 pt-1 border-t border-theme-border">
            <AlertCircle size={14} className="text-danger shrink-0" />
            <p className="text-xs text-theme-muted flex-1">Remove this holding?</p>
            <button
              onClick={() => { deleteHolding(holding.id); setConfirmDelete(false) }}
              disabled={deleting}
              className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? '…' : 'Remove'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isRealEstate) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AssetClassBadge assetClass={holding.assetClass} />
            <p className="text-sm font-medium text-theme-text truncate">{holding.name}</p>
          </div>
          {actionButtons}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold text-theme-text font-mono">
            {formatRupees(holding.currentValue)}
          </p>
          {realEstateRate !== null ? (
            <span className="text-sm font-medium text-emerald-600 shrink-0">{realEstateRate}% p.a.</span>
          ) : (
            <span className="text-xs text-theme-muted shrink-0">no rate set</span>
          )}
        </div>

        <p className="text-xs text-theme-muted">{daysAgo(holding.lastUpdated)}</p>

        {confirmDelete && (
          <div className="flex items-center gap-2 pt-1 border-t border-theme-border">
            <AlertCircle size={14} className="text-danger shrink-0" />
            <p className="text-xs text-theme-muted flex-1">Remove this holding?</p>
            <button
              onClick={() => { deleteHolding(holding.id); setConfirmDelete(false) }}
              disabled={deleting}
              className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? '…' : 'Remove'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isGold) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AssetClassBadge assetClass={holding.assetClass} />
            <p className="text-sm font-medium text-theme-text truncate">{holding.name}</p>
          </div>
          {actionButtons}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold text-theme-text font-mono">
            {formatRupees(holding.currentValue)}
          </p>
          {goldRate !== null ? (
            <span className="text-sm font-medium text-amber-600 shrink-0">{goldRate}% p.a.</span>
          ) : (
            <span className="text-xs text-theme-muted shrink-0">no rate set</span>
          )}
        </div>

        <p className="text-xs text-theme-muted">{daysAgo(holding.lastUpdated)}</p>

        {confirmDelete && (
          <div className="flex items-center gap-2 pt-1 border-t border-theme-border">
            <AlertCircle size={14} className="text-danger shrink-0" />
            <p className="text-xs text-theme-muted flex-1">Remove this holding?</p>
            <button
              onClick={() => { deleteHolding(holding.id); setConfirmDelete(false) }}
              disabled={deleting}
              className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? '…' : 'Remove'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isCash) {
    return (
      <div className="bg-theme-card border border-theme-border rounded-xl p-3 flex flex-col gap-2">
        {/* Compact header: badge + name inline */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AssetClassBadge assetClass={holding.assetClass} />
            <p className="text-sm font-medium text-theme-text truncate">{holding.name}</p>
          </div>
          {actionButtons}
        </div>

        {/* Balance + rate on one row */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-semibold text-theme-text font-mono">
            {formatRupees(holding.currentValue)}
          </p>
          {cashRate !== null ? (
            <span className="text-sm font-medium text-theme-primary shrink-0">{cashRate}% p.a.</span>
          ) : (
            <span className="text-xs text-theme-muted shrink-0">no rate set</span>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-theme-muted">{daysAgo(holding.lastUpdated)}</p>

        {/* Inline delete confirm */}
        {confirmDelete && (
          <div className="flex items-center gap-2 pt-1 border-t border-theme-border">
            <AlertCircle size={14} className="text-danger shrink-0" />
            <p className="text-xs text-theme-muted flex-1">Remove this holding?</p>
            <button
              onClick={() => { deleteHolding(holding.id); setConfirmDelete(false) }}
              disabled={deleting}
              className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? '…' : 'Remove'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-medium text-theme-text truncate">{holding.name}</p>
          <AssetClassBadge assetClass={holding.assetClass} />
        </div>
        {actionButtons}
      </div>

      {/* Values */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-theme-muted mb-0.5">
            {isRetirement ? 'Current Balance' : 'Current value'}
          </p>
          <p className="text-base font-semibold text-theme-text font-mono">
            {formatRupees(holding.currentValue)}
          </p>
        </div>
        {!isRetirement && (
          <div className="text-right">
            <p className="text-xs text-theme-muted mb-0.5">Invested</p>
            <p className="text-sm text-theme-muted font-mono">
              {formatRupees(holding.investedValue)}
            </p>
          </div>
        )}
      </div>

      {/* Gain/Loss + timestamp */}
      <div className="flex items-center justify-between">
        {!isRetirement && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isGain ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
            }`}
          >
            {isGain ? '+' : ''}{gainPct.toFixed(2)}%
          </span>
        )}
        <span className={`text-xs text-theme-muted ${isRetirement ? 'w-full text-right' : ''}`}>
          {daysAgo(holding.lastUpdated)}
        </span>
      </div>

      {/* Retirement projection */}
      {isRetirement && retMeta && (
        <div className="pt-2 mt-1 border-t border-theme-border grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-theme-muted mb-0.5">Rate of Return</p>
            <p className="text-sm font-medium text-theme-text">
              {retMeta.rate ? `${retMeta.rate}% p.a.` : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-theme-muted mb-0.5">Projected at 60</p>
            {retProjection ? (
              <>
                <p className="text-sm font-semibold text-purple-700 font-mono">
                  {formatRupeesCompact(retProjection.amount)}
                </p>
                <p className="text-xs text-theme-muted">in {retProjection.yearsTo60}y</p>
              </>
            ) : (
              <p className="text-sm text-theme-muted">—</p>
            )}
          </div>
        </div>
      )}

      {/* Bond / FD cash flow info */}
      {hasPaymentInfo && (() => {
        const days = daysUntil(nextPayment.date)
        const isOverdue = days < 0
        const isTodayOrSoon = days >= 0 && days <= 30
        const payFreq = bondMeta!.payoutFreq!
        const coupon = bondMeta!.couponRate
          ? (payFreq === 'maturity'
              ? holding.currentValue
              : periodicCoupon(holding.investedValue, bondMeta!.couponRate, payFreq))
          : null
        return (
          <div className="pt-2 mt-1 border-t border-theme-border grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-theme-muted mb-0.5">Next Payment</p>
              {isOverdue ? (
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-danger/10 text-danger">Matured</span>
              ) : (
                <>
                  <p className="text-sm font-medium text-theme-text">{fmtPayDate(nextPayment.date)}</p>
                  <p className={`text-xs ${isTodayOrSoon ? 'text-amber-600 font-medium' : 'text-theme-muted'}`}>
                    {nextPayment.isMaturity ? 'at maturity' : days === 0 ? 'today' : `in ${days}d`}
                  </p>
                </>
              )}
            </div>
            {coupon !== null && (
              <div className="text-right">
                <p className="text-xs text-theme-muted mb-0.5">Expected Cashflow</p>
                <p className="text-sm font-semibold text-success font-mono">{formatRupees(coupon)}</p>
                <p className="text-xs text-theme-muted">
                  {payFreq === 'maturity' ? 'full payout' : `per ${payFreq === 'monthly' ? 'month' : 'quarter'}`}
                </p>
              </div>
            )}
          </div>
        )
      })()}

      {/* Inline delete confirm */}
      {confirmDelete && (
        <div className="flex items-center gap-2 pt-1 border-t border-theme-border">
          <AlertCircle size={14} className="text-danger shrink-0" />
          <p className="text-xs text-theme-muted flex-1">Remove this holding?</p>
          <button
            onClick={() => {
              deleteHolding(holding.id)
              setConfirmDelete(false)
            }}
            disabled={deleting}
            className="text-xs px-2 py-1 rounded bg-danger/15 text-danger hover:bg-danger/25 transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? '…' : 'Remove'}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs px-2 py-1 rounded hover:bg-theme-border text-theme-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
