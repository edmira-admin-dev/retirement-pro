import { useState, useMemo } from 'react'
import {
  RefreshCw, Loader2, TrendingUp, TrendingDown, Minus,
  AlertCircle, Eye, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { useGenerateSignals, useSignalsForDate, useSignalDates, type StockSignal } from '../hooks/useTradeSignals'
import SignalStatsPanel from '../components/trading/SignalStatsPanel'

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

const SIGNAL_STYLES: Record<StockSignal['signal'], { bg: string; text: string; border: string; label: string }> = {
  BUY:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', label: '▲ BUY' },
  SHORT:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   label: '▼ SHORT' },
  WATCH:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', label: '● WATCH' },
  NO_TRADE: { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',  label: '— SKIP' },
}

const OUTCOME_STYLES: Record<NonNullable<StockSignal['outcome']>['status'], { cls: string; label: string }> = {
  OPEN:    { cls: 'text-amber-600', label: 'Open' },
  WIN_T1:  { cls: 'text-green-600', label: 'Hit T1' },
  WIN_T2:  { cls: 'text-green-700', label: 'Hit T2' },
  LOSS:    { cls: 'text-red-500',   label: 'SL Hit' },
  EXPIRED: { cls: 'text-theme-muted', label: 'Expired' },
}

const TREND_LABEL: Record<StockSignal['l1Trend'], string> = {
  BULL_FULL:    '▲▲ Full Bull',
  BULL_PARTIAL: '▲ Partial Bull',
  BEAR_FULL:    '▼▼ Full Bear',
  BEAR_PARTIAL: '▼ Partial Bear',
  NEUTRAL:      '— Neutral',
}

const VOL_LABEL: Record<StockSignal['l2Volume'], { label: string; cls: string }> = {
  STRONG:     { label: '🔥 3×+',    cls: 'text-green-700' },
  GOOD:       { label: '✅ 2–3×',   cls: 'text-green-600' },
  ACCEPTABLE: { label: '⚡ 1.5–2×', cls: 'text-amber-600' },
  WEAK:       { label: '⚠️ <1.5×',  cls: 'text-red-500' },
}

// ── Signal row ────────────────────────────────────────────────────────────────

function SignalRow({ s }: { s: StockSignal }) {
  const [open, setOpen] = useState(false)
  const st = SIGNAL_STYLES[s.signal]
  const volMeta = s.l2Volume ? VOL_LABEL[s.l2Volume] : { label: '—', cls: 'text-gray-400' }

  if (s.error) {
    return (
      <tr className="bg-theme-card border-b border-theme-border">
        <td className="px-4 py-2.5 font-semibold text-theme-text text-sm">{s.symbol}</td>
        <td colSpan={9} className="px-4 py-2.5 text-xs text-red-400 font-mono">{s.error}</td>
      </tr>
    )
  }

  return (
    <>
      <tr
        className="bg-theme-card border-b border-theme-border hover:bg-theme-bg-alt transition-colors cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        {/* Symbol */}
        <td className="px-4 py-3">
          <p className="font-bold text-theme-text text-sm">{s.symbol}</p>
          <p className="text-xs text-theme-muted font-mono">{fmt(s.cmp)}</p>
        </td>
        {/* Signal badge */}
        <td className="px-3 py-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
            {st.label}
          </span>
          {s.signal === 'BUY' && s.outcome && (
            <span className={`block text-xs font-medium mt-1 ${OUTCOME_STYLES[s.outcome.status].cls}`}>
              {OUTCOME_STYLES[s.outcome.status].label}
            </span>
          )}
        </td>
        {/* Layer 1 Trend */}
        <td className="px-3 py-3 text-xs text-theme-muted whitespace-nowrap">
          {TREND_LABEL[s.l1Trend]}
        </td>
        {/* Layer 2 Volume */}
        <td className={`px-3 py-3 text-xs font-medium whitespace-nowrap ${volMeta.cls}`}>
          {volMeta.label}
          <span className="block text-theme-muted font-normal">{s.volRatio.toFixed(1)}× avg</span>
        </td>
        {/* RSI */}
        <td className="px-3 py-3 text-right">
          <span className={`text-sm font-semibold ${s.rsi >= 50 && s.rsi <= 70 ? 'text-green-600' : s.rsi <= 50 && s.rsi >= 30 ? 'text-red-500' : 'text-theme-muted'}`}>
            {s.rsi.toFixed(0)}
          </span>
        </td>
        {/* Entry */}
        <td className="px-3 py-3 text-right">
          {s.signal !== 'NO_TRADE' ? (
            <>
              <p className="text-sm font-semibold text-theme-text font-mono">{fmt(s.entry)}</p>
              <p className="text-xs text-red-500 font-mono">SL {fmt(s.stopLoss)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* T1 */}
        <td className="px-3 py-3 text-right">
          {s.signal !== 'NO_TRADE' ? (
            <>
              <p className="text-sm font-semibold text-green-600 font-mono">{fmt(s.target1)}</p>
              <p className="text-xs text-green-500">{fmtPct(s.t1ReturnPct)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* T2 */}
        <td className="px-3 py-3 text-right">
          {s.signal !== 'NO_TRADE' ? (
            <>
              <p className="text-sm font-semibold text-green-700 font-mono">{fmt(s.target2)}</p>
              <p className="text-xs text-green-600">{fmtPct(s.t2ReturnPct)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* ATR% */}
        <td className="px-3 py-3 text-right text-xs text-theme-muted">
          {s.atrPct?.toFixed(1)}%
        </td>
        {/* Expand */}
        <td className="px-3 py-3 text-center">
          {open ? <ChevronUp size={14} className="text-theme-muted mx-auto" /> : <ChevronDown size={14} className="text-theme-muted mx-auto" />}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-theme-bg-alt border-b border-theme-border">
          <td colSpan={10} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reasoning */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-theme-text uppercase tracking-wide flex items-center gap-1.5">
                  <Info size={12} /> Signal Reasoning
                </p>
                <p className="text-xs text-theme-muted leading-relaxed">{s.reasoning || s.l3Structure}</p>
                <p className="text-xs text-theme-muted">{s.l3Structure}</p>
              </div>
              {/* Indicators */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ['EMA 20', fmt(s.ema20)],
                  ['EMA 50', fmt(s.ema50)],
                  ['EMA 200', fmt(s.ema200)],
                  ['ATR', fmt(s.atr)],
                  ['PDH', fmt(s.pdh)],
                  ['PDL', fmt(s.pdl)],
                  ['Vol Today', (s.volToday / 1e6).toFixed(1) + 'M'],
                  ['Vol 20D Avg', (s.vol20dAvg / 1e6).toFixed(1) + 'M'],
                  ['Hold Period', s.holdDays],
                ].map(([k, v]) => (
                  <div key={k} className="bg-theme-card rounded-lg px-2.5 py-2">
                    <p className="text-theme-muted">{k}</p>
                    <p className="font-semibold text-theme-text mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Summary pills ─────────────────────────────────────────────────────────────

function SummaryPill({ label, count, cls }: { label: string; count: number; cls: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cls}`}>
      <span className="text-xl font-bold">{count}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterTab = 'ALL' | 'BUY' | 'SHORT' | 'WATCH' | 'NO_TRADE'

export default function TradeSignalPage() {
  const [selectedDate, setSelectedDate] = useState(today())
  const [filter, setFilter] = useState<FilterTab>('ALL')

  const { data: dates = [] } = useSignalDates()
  const { data: signals = [], isLoading } = useSignalsForDate(selectedDate)
  const generateMut = useGenerateSignals()

  const handleGenerate = () => {
    generateMut.mutate(undefined, {
      onSuccess: () => setSelectedDate(today()),
    })
  }

  const counts = useMemo(() => ({
    BUY:      signals.filter(s => s.signal === 'BUY').length,
    SHORT:    signals.filter(s => s.signal === 'SHORT').length,
    WATCH:    signals.filter(s => s.signal === 'WATCH').length,
    NO_TRADE: signals.filter(s => s.signal === 'NO_TRADE').length,
  }), [signals])

  const filtered = useMemo(() =>
    filter === 'ALL' ? signals : signals.filter(s => s.signal === filter),
    [signals, filter]
  )

  const sortedSignals = useMemo(() => {
    const order: Record<StockSignal['signal'], number> = { BUY: 0, SHORT: 1, WATCH: 2, NO_TRADE: 3 }
    return [...filtered].sort((a, b) => order[a.signal] - order[b.signal] || b.volRatio - a.volRatio)
  }, [filtered])

  const isGenerating = generateMut.isPending

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-theme-text">Trade Signals</h1>
          <p className="text-sm text-theme-muted mt-0.5">
            Nifty 250 · 4-layer swing strategy · Large & mid cap
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date selector */}
          {dates.length > 0 && (
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-theme-border bg-theme-card text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              {dates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
              {!dates.includes(today()) && (
                <option value={today()}>{today()} (today)</option>
              )}
            </select>
          )}

          {/* Refresh / Generate */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Fetch fresh signals"
          >
            {isGenerating
              ? <Loader2 size={16} className="animate-spin" />
              : <RefreshCw size={16} />}
            {isGenerating ? 'Generating…' : 'Run Signals'}
          </button>
        </div>
      </div>

      {/* Data source note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-blue-700">
        <span className="font-semibold">Data:</span> Yahoo Finance (NSE · 2Y daily · free · no broker required)
      </div>

      {/* Error */}
      {generateMut.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{generateMut.error.message}</p>
        </div>
      )}

      {/* Generating progress */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
          <div>
            <p className="font-medium text-blue-800 text-sm">Fetching 200 days of data for Nifty 50…</p>
            <p className="text-xs text-blue-600 mt-0.5">Computing EMA, RSI, ATR, Volume for ~250 stocks. Takes ~60–90 seconds.</p>
          </div>
        </div>
      )}

      <SignalStatsPanel />

      {/* Summary pills */}
      {signals.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <SummaryPill label="BUY"      count={counts.BUY}      cls="bg-green-50 border-green-200 text-green-700" />
          <SummaryPill label="SHORT"    count={counts.SHORT}    cls="bg-red-50 border-red-200 text-red-700" />
          <SummaryPill label="WATCH"    count={counts.WATCH}    cls="bg-amber-50 border-amber-200 text-amber-700" />
          <SummaryPill label="NO TRADE" count={counts.NO_TRADE} cls="bg-gray-50 border-gray-200 text-gray-500" />
        </div>
      )}

      {/* Filter tabs */}
      {signals.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'BUY', 'SHORT', 'WATCH', 'NO_TRADE'] as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text border border-theme-border'
              }`}
            >
              {f === 'NO_TRADE' ? 'SKIP' : f}{f !== 'ALL' ? ` (${counts[f as keyof typeof counts] ?? 0})` : ` (${signals.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isGenerating && signals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <TrendingUp size={40} className="text-theme-muted opacity-30" />
          <p className="text-theme-muted text-sm">No signals for {selectedDate}</p>
          <p className="text-xs text-theme-muted">Click "Run Signals" to fetch data and compute today's signals</p>
        </div>
      )}

      {/* Signal table */}
      {sortedSignals.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-theme-border">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-theme-border bg-theme-bg-alt text-xs text-theme-muted uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Symbol</th>
                <th className="px-3 py-3 text-left font-semibold">Signal</th>
                <th className="px-3 py-3 text-left font-semibold">L1 Trend</th>
                <th className="px-3 py-3 text-left font-semibold">L2 Volume</th>
                <th className="px-3 py-3 text-right font-semibold">RSI</th>
                <th className="px-3 py-3 text-right font-semibold">Entry / SL</th>
                <th className="px-3 py-3 text-right font-semibold">T1 (1.5R)</th>
                <th className="px-3 py-3 text-right font-semibold">T2 (2.5R)</th>
                <th className="px-3 py-3 text-right font-semibold">ATR%</th>
                <th className="px-3 py-3 text-center font-semibold w-8"></th>
              </tr>
            </thead>
            <tbody>
              {sortedSignals.map(s => (
                <SignalRow key={s.symbol} s={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Strategy legend */}
      {signals.length > 0 && (
        <div className="bg-theme-bg-alt rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-theme-muted">
          {[
            { icon: <TrendingUp size={12} className="text-green-600" />, label: 'BUY', desc: 'All 4 layers bullish aligned' },
            { icon: <TrendingDown size={12} className="text-red-500" />, label: 'SHORT', desc: 'All 4 layers bearish aligned' },
            { icon: <Eye size={12} className="text-amber-600" />, label: 'WATCH', desc: 'Trend ok, volume not yet 1.5×' },
            { icon: <Minus size={12} className="text-gray-400" />, label: 'SKIP', desc: 'Layers not aligned — no trade' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="mt-0.5">{icon}</span>
              <div>
                <p className="font-semibold text-theme-text">{label}</p>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
