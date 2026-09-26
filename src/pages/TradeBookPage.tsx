import React, { useMemo, useState, type ReactNode } from 'react'
import { BarChart2, TrendingUp, TrendingDown, Gift, Receipt, RefreshCw, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { useTaxPnlData, useTrades, type TaxPnlDbData } from '../hooks/useTradeBook'

// ── Types ─────────────────────────────────────────────────────────────────────

type Broker = 'ALL' | 'ZERODHA' | 'GROWW' | 'HDFC' | 'ANGEL' | 'YESBANK'
type RangePreset = 'ALL' | 'FY25' | 'FY26' | 'YTD' | 'CUSTOM'
type Tab = 'realizedPnl' | 'dividends' | 'charges' | 'trades'

interface DateRange { from: string; to: string }

const BROKERS: { id: Broker; label: string }[] = [
  { id: 'ALL',     label: 'All Brokers' },
  { id: 'ZERODHA', label: 'Zerodha'     },
  { id: 'GROWW',   label: 'Groww'       },
  { id: 'HDFC',    label: 'HDFC Sky'    },
  { id: 'ANGEL',   label: 'Angel One'   },
  { id: 'YESBANK', label: 'Yes Bank'    },
]

const PRESETS: { id: RangePreset; label: string; range: DateRange | null }[] = [
  { id: 'ALL',    label: 'All Time',    range: null },
  { id: 'FY25',   label: 'FY 2024-25', range: { from: '2024-04-01', to: '2025-03-31' } },
  { id: 'FY26',   label: 'FY 2025-26', range: { from: '2025-04-01', to: '2026-03-31' } },
  { id: 'YTD',    label: 'FY 2026-27', range: { from: '2026-04-01', to: new Date().toISOString().slice(0, 10) } },
  { id: 'CUSTOM', label: 'Custom',     range: null },
]

function inRange(date: string, range: DateRange | null) {
  if (!range) return true
  return date >= range.from && date <= range.to
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtINR(n: number) {
  const abs = Math.abs(n)
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function pnlCls(n: number) { return n >= 0 ? 'text-green-600' : 'text-red-500' }
function sign(n: number)   { return n > 0 ? '+' : '' }

function htBadge(ht: string) {
  const u = ht.toUpperCase()
  if (u.includes('LTCG')) return 'bg-purple-100 text-purple-700'
  if (u.includes('STCG')) return 'bg-blue-100 text-blue-700'
  if (u === 'INTRADAY') return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-600'
}

// ── Summary cards ─────────────────────────────────────────────────────────────

interface Summary {
  stcg: number; ltcg: number; realized: number
  dividends: number; tradeCharges: number; otherCharges: number; netPnl: number
}

function SummaryCards({ s }: { s: Summary }) {
  const cards = [
    { label: 'STCG',          value: s.stcg,           bg: 'bg-blue-50',   text: 'text-blue-700'   },
    { label: 'LTCG',          value: s.ltcg,           bg: 'bg-purple-50', text: 'text-purple-700' },
    { label: 'Realized P&L',  value: s.realized,       bg: s.realized  >= 0 ? 'bg-green-50' : 'bg-red-50', text: s.realized  >= 0 ? 'text-green-700' : 'text-red-600' },
    { label: 'Dividends',     value: s.dividends,      bg: 'bg-amber-50',  text: 'text-amber-700'  },
    { label: 'Trade Charges', value: -s.tradeCharges,  bg: 'bg-rose-50',   text: 'text-rose-700'   },
    { label: 'Other Debits',  value: -s.otherCharges,  bg: 'bg-rose-50',   text: 'text-rose-700'   },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-3 ${c.bg}`}>
            <p className="text-xs text-theme-muted">{c.label}</p>
            <p className={`text-sm font-bold mt-0.5 ${c.text}`}>
              {c.value > 0 ? '+' : ''}{fmtINR(c.value)}
            </p>
          </div>
        ))}
      </div>
      <div className={`rounded-xl p-4 flex items-center justify-between ${s.netPnl >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div>
          <p className="text-xs text-theme-muted">Net P&L (Realized + Dividends − All Charges)</p>
          <p className={`text-xl font-bold mt-0.5 ${pnlCls(s.netPnl)}`}>{sign(s.netPnl)}{fmtINR(s.netPnl)}</p>
        </div>
        <div className="text-right text-xs text-theme-muted space-y-0.5">
          <p>Trade charges: <span className="text-rose-600 font-medium">-{fmtINR(s.tradeCharges)}</span></p>
          <p>Other debits: <span className="text-rose-600 font-medium">-{fmtINR(s.otherCharges)}</span></p>
        </div>
      </div>
    </div>
  )
}

// ── Tables ────────────────────────────────────────────────────────────────────

type RealizedRow = TaxPnlDbData['realizedPnl'][0]
type DividendRow = TaxPnlDbData['dividends'][0]
type ChargeRow   = TaxPnlDbData['charges'][0]

interface SymbolGroup {
  symbol: string
  isin: string
  totalProfit: number
  totalCharges: number
  netProfit: number
  lots: number
  stcg: number
  ltcg: number
  trades: RealizedRow[]
}

function groupBySymbol(records: RealizedRow[]): SymbolGroup[] {
  const map = new Map<string, SymbolGroup>()
  for (const r of records) {
    const key = r.isin || r.symbol
    if (!map.has(key)) {
      map.set(key, { symbol: r.symbol, isin: r.isin, totalProfit: 0, totalCharges: 0, netProfit: 0, lots: 0, stcg: 0, ltcg: 0, trades: [] })
    }
    const g = map.get(key)!
    g.totalProfit  += r.profit
    g.totalCharges += r.tradeCharges ?? 0
    g.lots++
    const ht = r.holdingType.toUpperCase()
    if (ht.includes('STCG') || ht === 'INTRADAY') g.stcg += r.profit
    else if (ht.includes('LTCG'))                  g.ltcg += r.profit
    g.trades.push(r)
  }
  for (const g of map.values()) g.netProfit = g.totalProfit - g.totalCharges
  return Array.from(map.values()).sort((a, b) => Math.abs(b.netProfit) - Math.abs(a.netProfit))
}

function RealizedPnlTable({ records }: { records: RealizedRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!records.length) return <p className="text-sm text-theme-muted text-center py-12">No realized P&L in this period</p>

  const groups = groupBySymbol(records)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-3 py-2.5 w-8" />
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Symbol</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Exits</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">STCG</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">LTCG</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Realized P&L</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted text-rose-600">Charges</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Net P&L</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => {
            const isExp = expanded === (g.isin || g.symbol)
            return (
              <React.Fragment key={g.isin || g.symbol}>
                <tr
                  onClick={() => setExpanded(isExp ? null : (g.isin || g.symbol))}
                  className={`border-b border-theme-border cursor-pointer transition-colors ${isExp ? 'bg-indigo-50' : 'hover:bg-theme-bg-alt/60'}`}
                >
                  <td className="px-3 py-2.5 text-theme-muted">
                    {isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-theme-text">{g.symbol}</p>
                    {g.isin && <p className="text-[10px] text-theme-muted">{g.isin}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-theme-muted text-xs">{g.lots}</td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${g.stcg !== 0 ? pnlCls(g.stcg) : 'text-theme-muted'}`}>
                    {g.stcg !== 0 ? `${sign(g.stcg)}${fmtINR(g.stcg)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${g.ltcg !== 0 ? pnlCls(g.ltcg) : 'text-theme-muted'}`}>
                    {g.ltcg !== 0 ? `${sign(g.ltcg)}${fmtINR(g.ltcg)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${pnlCls(g.totalProfit)}`}>
                    {sign(g.totalProfit)}{fmtINR(g.totalProfit)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-600">
                    {g.totalCharges > 0 ? `-${fmtINR(g.totalCharges)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-bold ${pnlCls(g.netProfit)}`}>
                    {sign(g.netProfit)}{fmtINR(g.netProfit)}
                  </td>
                </tr>
                {isExp && (
                  <tr>
                    <td colSpan={8} className="px-0 py-0">
                      <div className="border-t-2 border-indigo-100 bg-indigo-50/30 px-4 py-3">
                        <p className="text-xs font-semibold text-theme-muted mb-2">Individual exits ({g.trades.length})</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-theme-muted border-b border-theme-border">
                                <th className="px-2 py-1.5 text-left font-medium">Type</th>
                                <th className="px-2 py-1.5 text-left font-medium">Entry</th>
                                <th className="px-2 py-1.5 text-left font-medium">Exit</th>
                                <th className="px-2 py-1.5 text-right font-medium">Qty</th>
                                <th className="px-2 py-1.5 text-right font-medium">Buy Value</th>
                                <th className="px-2 py-1.5 text-right font-medium">Sell Value</th>
                                <th className="px-2 py-1.5 text-right font-medium">Profit</th>
                                <th className="px-2 py-1.5 text-right font-medium">Charges</th>
                                <th className="px-2 py-1.5 text-right font-medium">Net</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...g.trades].sort((a, b) => b.exitDate.localeCompare(a.exitDate)).map((r, i) => {
                                const net = r.profit - (r.tradeCharges ?? 0)
                                return (
                                  <tr key={r.id ?? i} className="border-b border-theme-border/50 last:border-0">
                                    <td className="px-2 py-1.5">
                                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${htBadge(r.holdingType)}`}>
                                        {r.holdingType}
                                      </span>
                                    </td>
                                    <td className="px-2 py-1.5 text-theme-muted">{r.entryDate?.slice(0, 10) ?? '—'}</td>
                                    <td className="px-2 py-1.5 text-theme-muted">{r.exitDate?.slice(0, 10) ?? '—'}</td>
                                    <td className="px-2 py-1.5 text-right tabular-nums">{r.quantity}</td>
                                    <td className="px-2 py-1.5 text-right tabular-nums text-theme-muted">{fmtINR(r.buyValue)}</td>
                                    <td className="px-2 py-1.5 text-right tabular-nums">{fmtINR(r.sellValue)}</td>
                                    <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${pnlCls(r.profit)}`}>
                                      {sign(r.profit)}{fmtINR(r.profit)}
                                    </td>
                                    <td className="px-2 py-1.5 text-right tabular-nums text-rose-600">
                                      {(r.tradeCharges ?? 0) > 0 ? `-${fmtINR(r.tradeCharges)}` : '—'}
                                    </td>
                                    <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${pnlCls(net)}`}>
                                      {sign(net)}{fmtINR(net)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DividendsTable({ dividends }: { dividends: DividendRow[] }) {
  if (!dividends.length) return <p className="text-sm text-theme-muted text-center py-12">No dividends in this period</p>
  const total = dividends.reduce((s, d) => s + d.netAmount, 0)
  return (
    <div className="overflow-x-auto">
      <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium">
        Total: +{fmtINR(total)} across {dividends.length} payment{dividends.length !== 1 ? 's' : ''}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Symbol</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Ex-Date</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Qty</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">DPS</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {dividends.map((d, i) => (
            <tr key={d.id ?? i} className="border-b border-theme-border last:border-0 hover:bg-theme-bg-alt/50 transition-colors">
              <td className="px-4 py-2.5 font-semibold text-theme-text">{d.symbol}</td>
              <td className="px-3 py-2.5 text-xs text-theme-muted whitespace-nowrap">{d.exDate?.slice(0, 10)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{d.quantity}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">₹{d.dividendPerShare.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-amber-600">+{fmtINR(d.netAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChargesTable({ charges }: { charges: ChargeRow[] }) {
  if (!charges.length) return <p className="text-sm text-theme-muted text-center py-12">No charges in this period</p>
  const total = charges.reduce((s, c) => s + c.amount, 0)
  return (
    <div className="overflow-x-auto">
      <div className="px-3 py-2 bg-rose-50 border-b border-rose-100 text-xs text-rose-700 font-medium">
        Total debits: -{fmtINR(total)} across {charges.length} entr{charges.length !== 1 ? 'ies' : 'y'}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Account Head</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Period</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Amount</th>
          </tr>
        </thead>
        <tbody>
          {charges.map((c, i) => (
            <tr key={i} className="border-b border-theme-border last:border-0 hover:bg-theme-bg-alt/50 transition-colors">
              <td className="px-4 py-2.5 text-theme-text">{c.accountHead}</td>
              <td className="px-3 py-2.5 text-xs text-theme-muted whitespace-nowrap">{c.periodFrom?.slice(0, 10)} → {c.periodTo?.slice(0, 10)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 font-medium">-{fmtINR(c.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface TradeRow { symbol: string; tradeDate: string; tradeType: string; quantity: number; price: number; exchange: string }

function TradesTable({ trades }: { trades: TradeRow[] }) {
  if (!trades.length) return <p className="text-sm text-theme-muted text-center py-12">No trades in this period</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Symbol</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Date</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Type</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Qty</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Price</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Value</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Exch</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => {
            const isBuy = t.tradeType?.toLowerCase() === 'buy'
            return (
              <tr key={i} className="border-b border-theme-border last:border-0 hover:bg-theme-bg-alt/50 transition-colors">
                <td className="px-4 py-2.5 font-semibold text-theme-text">{t.symbol}</td>
                <td className="px-3 py-2.5 text-xs text-theme-muted whitespace-nowrap">{t.tradeDate?.slice(0, 10)}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isBuy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.tradeType?.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{t.quantity}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmtINR(t.price)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium">{fmtINR(t.quantity * t.price)}</td>
                <td className="px-3 py-2.5 text-xs text-theme-muted">{t.exchange}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TradeBookPage() {
  const [broker, setBroker] = useState<Broker>('ALL')
  const [preset, setPreset] = useState<RangePreset>('ALL')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [tab, setTab] = useState<Tab>('realizedPnl')

  const { data, isLoading, refetch, isFetching } = useTaxPnlData(broker)
  const tradesQuery = useTrades()

  const activeRange = useMemo<DateRange | null>(() => {
    if (preset === 'CUSTOM') return customFrom && customTo ? { from: customFrom, to: customTo } : null
    return PRESETS.find(p => p.id === preset)?.range ?? null
  }, [preset, customFrom, customTo])

  const filtered = useMemo(() => {
    if (!data) return { realizedPnl: [] as TaxPnlDbData['realizedPnl'], dividends: [] as TaxPnlDbData['dividends'], charges: [] as TaxPnlDbData['charges'] }
    return {
      realizedPnl: data.realizedPnl.filter(r => inRange(r.exitDate, activeRange)),
      dividends:   data.dividends.filter(d => inRange(d.exDate, activeRange)),
      charges:     data.charges.filter(c => inRange(c.periodFrom, activeRange) || inRange(c.periodTo, activeRange)),
    }
  }, [data, activeRange])

  const filteredTrades = useMemo(() => {
    return (tradesQuery.data ?? []).filter(t => inRange(t.tradeDate, activeRange))
  }, [tradesQuery.data, activeRange])

  const summary = useMemo<Summary>(() => {
    const stcg = filtered.realizedPnl.filter(r => r.holdingType === 'STCG' || r.holdingType === 'NON_EQ_STCG').reduce((s, r) => s + r.profit, 0)
    const ltcg = filtered.realizedPnl.filter(r => r.holdingType === 'LTCG' || r.holdingType === 'NON_EQ_LTCG').reduce((s, r) => s + r.profit, 0)
    const intraday = filtered.realizedPnl.filter(r => r.holdingType === 'INTRADAY').reduce((s, r) => s + r.profit, 0)
    const realized = stcg + ltcg + intraday
    const dividends = filtered.dividends.reduce((s, d) => s + d.netAmount, 0)
    const tradeCharges = filtered.realizedPnl.reduce((s, r) => s + (r.tradeCharges ?? 0), 0)
    const otherCharges = filtered.charges.reduce((s, c) => s + c.amount, 0)
    return { stcg, ltcg, realized, dividends, tradeCharges, otherCharges, netPnl: realized + dividends - tradeCharges - otherCharges }
  }, [filtered])

  const DATA_TABS: { id: Tab; label: string; icon: ReactNode; count: number }[] = [
    { id: 'realizedPnl', label: 'Realized P&L', icon: <TrendingUp size={14} />,   count: filtered.realizedPnl.length },
    { id: 'dividends',   label: 'Dividends',    icon: <Gift size={14} />,          count: filtered.dividends.length   },
    { id: 'charges',     label: 'Charges',      icon: <Receipt size={14} />,       count: filtered.charges.length     },
    { id: 'trades',      label: 'Trades',       icon: <TrendingDown size={14} />,  count: filteredTrades.length       },
  ]

  const isRefreshing = isFetching || tradesQuery.isFetching

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <BarChart2 size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-text">Tradebook</h1>
            <p className="text-xs text-theme-muted">Realized P&L, dividends, charges and trades across all brokers</p>
          </div>
        </div>
        <button
          onClick={() => { refetch(); tradesQuery.refetch() }}
          disabled={isRefreshing}
          className="p-2 rounded-xl border border-theme-border text-theme-muted hover:bg-theme-bg-alt transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          {isRefreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        </button>
      </div>

      {/* Broker filter */}
      <div className="flex items-center gap-1 bg-theme-bg-alt border border-theme-border rounded-xl p-1 w-fit overflow-x-auto">
        {BROKERS.map(b => (
          <button
            key={b.id}
            onClick={() => setBroker(b.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              broker === b.id
                ? 'bg-theme-card shadow-sm text-theme-text border border-theme-border'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${preset === p.id ? 'bg-indigo-600 text-white' : 'bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text'}`}
          >
            {p.label}
          </button>
        ))}
        {preset === 'CUSTOM' && (
          <div className="flex items-center gap-2 ml-1">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="text-xs border border-theme-border rounded-lg px-2 py-1.5 bg-white text-theme-text" />
            <span className="text-xs text-theme-muted">to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="text-xs border border-theme-border rounded-lg px-2 py-1.5 bg-white text-theme-text" />
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Summary cards */}
      {!isLoading && data && <SummaryCards s={summary} />}

      {/* Empty state */}
      {!isLoading && !data && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <BarChart2 size={32} className="text-theme-muted" />
          <p className="text-sm font-medium text-theme-text">No data yet</p>
          <p className="text-xs text-theme-muted">Upload broker files from the Tax P&L page to populate this view</p>
        </div>
      )}

      {/* Data table */}
      {!isLoading && data && (
        <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
          <div className="flex border-b border-theme-border overflow-x-auto">
            {DATA_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
                  ${tab === t.id ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt'}`}
              >
                {t.icon}
                {t.label}
                <span className="ml-1 text-xs bg-theme-bg-alt px-1.5 py-0.5 rounded-full">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {tab === 'realizedPnl' && <RealizedPnlTable records={filtered.realizedPnl} />}
            {tab === 'dividends'   && <DividendsTable dividends={filtered.dividends} />}
            {tab === 'charges'     && <ChargesTable charges={filtered.charges} />}
            {tab === 'trades'      && <TradesTable trades={filteredTrades} />}
          </div>
        </div>
      )}
    </div>
  )
}
