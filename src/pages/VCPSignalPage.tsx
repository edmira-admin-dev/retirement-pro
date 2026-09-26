import { useState, useMemo } from 'react'
import {
  RefreshCw, Loader2, TrendingUp, Eye, Minus,
  AlertCircle, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { useGenerateVCPSignals, useVCPSignalsForDate, useVCPSignalDates, type VCPStockSignal } from '../hooks/useVCPSignals'

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

const SIGNAL_STYLES: Record<VCPStockSignal['signal'], { bg: string; text: string; border: string; label: string }> = {
  BUY:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', label: '▲ BUY' },
  WATCH:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', label: '● WATCH' },
  NO_SETUP: { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',  label: '— NO SETUP' },
}

// ── Signal row ────────────────────────────────────────────────────────────────

function SignalRow({ s }: { s: VCPStockSignal }) {
  const [open, setOpen] = useState(false)
  const st = SIGNAL_STYLES[s.signal]

  if (s.error) {
    return (
      <tr className="bg-theme-card border-b border-theme-border">
        <td className="px-4 py-2.5 font-semibold text-theme-text text-sm">{s.symbol}</td>
        <td colSpan={8} className="px-4 py-2.5 text-xs text-red-400 font-mono">{s.error}</td>
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
        </td>
        {/* Trend template score */}
        <td className="px-3 py-3 text-xs whitespace-nowrap">
          <span className={`font-semibold ${s.trendTemplateScore >= 6 ? 'text-green-600' : 'text-theme-muted'}`}>
            {s.trendTemplateScore}/{s.trendTemplateMax}
          </span>
          <span className="block text-theme-muted font-normal">trend template</span>
        </td>
        {/* Contractions */}
        <td className="px-3 py-3 text-xs whitespace-nowrap">
          <span className="font-semibold text-theme-text">{s.contractions.length} legs</span>
          <span className="block text-theme-muted font-normal">
            {s.contractions.length > 0 ? `tightest ${s.contractions[s.contractions.length - 1].rangePct}%` : '—'}
          </span>
        </td>
        {/* Vol dry-up */}
        <td className="px-3 py-3 text-right">
          <span className={`text-sm font-semibold ${s.volDryUpRatio <= 0.75 ? 'text-green-600' : 'text-theme-muted'}`}>
            {(s.volDryUpRatio * 100).toFixed(0)}%
          </span>
        </td>
        {/* Pivot / Entry */}
        <td className="px-3 py-3 text-right">
          {s.signal !== 'NO_SETUP' ? (
            <>
              <p className="text-sm font-semibold text-theme-text font-mono">{fmt(s.pivot)}</p>
              <p className="text-xs text-red-500 font-mono">SL {fmt(s.stopLoss)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* T1 */}
        <td className="px-3 py-3 text-right">
          {s.signal === 'BUY' ? (
            <>
              <p className="text-sm font-semibold text-green-600 font-mono">{fmt(s.target1)}</p>
              <p className="text-xs text-green-500">{fmtPct(s.t1ReturnPct)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* T2 */}
        <td className="px-3 py-3 text-right">
          {s.signal === 'BUY' ? (
            <>
              <p className="text-sm font-semibold text-green-700 font-mono">{fmt(s.target2)}</p>
              <p className="text-xs text-green-600">{fmtPct(s.t2ReturnPct)}</p>
            </>
          ) : <span className="text-theme-muted text-xs">—</span>}
        </td>
        {/* Expand */}
        <td className="px-3 py-3 text-center">
          {open ? <ChevronUp size={14} className="text-theme-muted mx-auto" /> : <ChevronDown size={14} className="text-theme-muted mx-auto" />}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-theme-bg-alt border-b border-theme-border">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reasoning */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-theme-text uppercase tracking-wide flex items-center gap-1.5">
                  <Info size={12} /> Signal Reasoning
                </p>
                <p className="text-xs text-theme-muted leading-relaxed">{s.reasoning}</p>
                {s.contractions.length > 0 && (
                  <p className="text-xs text-theme-muted">
                    Legs: {s.contractions.map(c => `₹${c.high}→₹${c.low} (${c.rangePct}%)`).join(' · ')}
                  </p>
                )}
              </div>
              {/* Indicators */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ['50 SMA', fmt(s.sma50)],
                  ['150 SMA', fmt(s.sma150)],
                  ['200 SMA', fmt(s.sma200)],
                  ['52W High', fmt(s.week52High)],
                  ['52W Low', fmt(s.week52Low)],
                  ['% From 52W High', `${s.pctFrom52wHigh.toFixed(1)}%`],
                  ['% Above 52W Low', `${s.pctAbove52wLow.toFixed(1)}%`],
                  ['Vol Today', `${s.volRatioToday.toFixed(1)}×`],
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

type FilterTab = 'ALL' | 'BUY' | 'WATCH' | 'NO_SETUP'

export default function VCPSignalPage() {
  const [selectedDate, setSelectedDate] = useState(today())
  const [filter, setFilter] = useState<FilterTab>('ALL')

  const { data: dates = [] } = useVCPSignalDates()
  const { data: signals = [], isLoading } = useVCPSignalsForDate(selectedDate)
  const generateMut = useGenerateVCPSignals()

  const handleGenerate = () => {
    generateMut.mutate(undefined, {
      onSuccess: () => setSelectedDate(today()),
    })
  }

  const counts = useMemo(() => ({
    BUY:      signals.filter(s => s.signal === 'BUY').length,
    WATCH:    signals.filter(s => s.signal === 'WATCH').length,
    NO_SETUP: signals.filter(s => s.signal === 'NO_SETUP').length,
  }), [signals])

  const filtered = useMemo(() =>
    filter === 'ALL' ? signals : signals.filter(s => s.signal === filter),
    [signals, filter]
  )

  const sortedSignals = useMemo(() => {
    const order: Record<VCPStockSignal['signal'], number> = { BUY: 0, WATCH: 1, NO_SETUP: 2 }
    return [...filtered].sort((a, b) => order[a.signal] - order[b.signal] || b.trendTemplateScore - a.trendTemplateScore)
  }, [filtered])

  const isGenerating = generateMut.isPending

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-theme-text">VCP Signals</h1>
          <p className="text-sm text-theme-muted mt-0.5">
            Nifty 250 · Mark Minervini Volatility Contraction Pattern · Stage 2 breakouts
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
            title="Fetch fresh VCP signals"
          >
            {isGenerating
              ? <Loader2 size={16} className="animate-spin" />
              : <RefreshCw size={16} />}
            {isGenerating ? 'Generating…' : 'Run VCP Scan'}
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
            <p className="font-medium text-blue-800 text-sm">Fetching 2Y of data for Nifty 250…</p>
            <p className="text-xs text-blue-600 mt-0.5">Computing trend template, swing contractions, volume dry-up. Takes ~60–90 seconds.</p>
          </div>
        </div>
      )}

      {/* Summary pills */}
      {signals.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <SummaryPill label="BUY"       count={counts.BUY}      cls="bg-green-50 border-green-200 text-green-700" />
          <SummaryPill label="WATCH"     count={counts.WATCH}    cls="bg-amber-50 border-amber-200 text-amber-700" />
          <SummaryPill label="NO SETUP"  count={counts.NO_SETUP} cls="bg-gray-50 border-gray-200 text-gray-500" />
        </div>
      )}

      {/* Filter tabs */}
      {signals.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'BUY', 'WATCH', 'NO_SETUP'] as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text border border-theme-border'
              }`}
            >
              {f === 'NO_SETUP' ? 'NO SETUP' : f}{f !== 'ALL' ? ` (${counts[f as keyof typeof counts] ?? 0})` : ` (${signals.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isGenerating && signals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <TrendingUp size={40} className="text-theme-muted opacity-30" />
          <p className="text-theme-muted text-sm">No VCP signals for {selectedDate}</p>
          <p className="text-xs text-theme-muted">Click "Run VCP Scan" to fetch data and compute today's setups</p>
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
                <th className="px-3 py-3 text-left font-semibold">Trend Template</th>
                <th className="px-3 py-3 text-left font-semibold">Contractions</th>
                <th className="px-3 py-3 text-right font-semibold">Vol Dry-Up</th>
                <th className="px-3 py-3 text-right font-semibold">Pivot / SL</th>
                <th className="px-3 py-3 text-right font-semibold">T1 (2R)</th>
                <th className="px-3 py-3 text-right font-semibold">T2 (4R)</th>
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
            { icon: <TrendingUp size={12} className="text-green-600" />, label: 'BUY', desc: 'Trend template ≥6/8, tightening base, breaking pivot on volume' },
            { icon: <Eye size={12} className="text-amber-600" />, label: 'WATCH', desc: 'Base formed, volume dried up, price near pivot' },
            { icon: <Minus size={12} className="text-gray-400" />, label: 'NO SETUP', desc: 'Trend or contraction criteria not met' },
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
