import React, { useRef, useState, useMemo } from 'react'
import {
  Upload, FileText, FilePlus, Loader2, X, AlertCircle,
  BarChart2, Gift, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Receipt,
  Save, CheckCircle2, Trash2,
} from 'lucide-react'
import {
  useParseFiles, mergeParseResults, useSaveTaxPnl, useDeleteTaxPnl,
  type ParsedRealizedPnl, type ParsedDividend, type ParsedHolding, type ParsedCharge,
} from '../hooks/useTradeBook'

// ── Types ─────────────────────────────────────────────────────────────────────

type Broker = 'zerodha' | 'groww' | 'hdfc' | 'angel' | 'yesbank'
type RangePreset = 'ALL' | 'FY25' | 'FY26' | 'YTD' | 'CUSTOM'
interface DateRange { from: string; to: string }

const BROKERS: { id: Broker; label: string; color: string; abbr: string }[] = [
  { id: 'zerodha', label: 'Zerodha',   color: '#387ed1', abbr: 'Z' },
  { id: 'groww',   label: 'Groww',     color: '#00d09c', abbr: 'G' },
  { id: 'hdfc',    label: 'HDFC Sky',  color: '#e31837', abbr: 'H' },
  { id: 'angel',   label: 'Angel One', color: '#f8a100', abbr: 'A' },
  { id: 'yesbank', label: 'Yes Bank',  color: '#003057', abbr: 'Y' },
]

const PRESETS: { id: RangePreset; label: string; range: DateRange | null }[] = [
  { id: 'ALL',    label: 'All Time',   range: null },
  { id: 'FY25',   label: 'FY 2024-25', range: { from: '2024-04-01', to: '2025-03-31' } },
  { id: 'FY26',   label: 'FY 2025-26', range: { from: '2025-04-01', to: '2026-03-31' } },
  { id: 'YTD',    label: 'YTD',        range: { from: '2026-04-01', to: new Date().toISOString().slice(0, 10) } },
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

// Normalize non-equity holdingType display
function holdingTypeLabel(ht: string): string {
  switch (ht) {
    case 'STCG':        return 'STCG'
    case 'LTCG':        return 'LTCG'
    case 'INTRADAY':    return 'Intraday'
    case 'NON_EQ_STCG': return 'Non-Eq ST'
    case 'NON_EQ_LTCG': return 'Non-Eq LT'
    default:            return ht
  }
}

function holdingTypeBadgeClass(ht: string): string {
  switch (ht) {
    case 'STCG':        return 'bg-blue-100 text-blue-700'
    case 'LTCG':        return 'bg-purple-100 text-purple-700'
    case 'INTRADAY':    return 'bg-orange-100 text-orange-700'
    case 'NON_EQ_STCG': return 'bg-cyan-100 text-cyan-700'
    case 'NON_EQ_LTCG': return 'bg-teal-100 text-teal-700'
    default:            return 'bg-gray-100 text-gray-600'
  }
}

// ── File drop zone ────────────────────────────────────────────────────────────

interface FileQueueProps {
  files: File[]
  onAdd: (files: File[]) => void
  onRemove: (i: number) => void
  isParsing: boolean
}

function FileDropZone({ files, onAdd, onRemove, isParsing }: FileQueueProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const add = (list: FileList | null) => { if (list) onAdd(Array.from(list)) }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors
          ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-theme-border hover:border-indigo-300 hover:bg-theme-bg-alt'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }}
      >
        <input ref={inputRef} type="file" className="hidden" accept=".xlsx,.pdf" multiple
          onChange={e => { add(e.target.files); e.target.value = '' }} />
        <FilePlus size={24} className="text-theme-muted" />
        <p className="text-sm font-medium text-theme-text">Drop Tax P&L files or click to add</p>
        <p className="text-xs text-theme-muted">*.xlsx or *.pdf — multiple files, multiple years</p>
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-theme-bg-alt rounded-lg">
              <FileText size={14} className="text-indigo-500 shrink-0" />
              <p className="flex-1 text-sm text-theme-text truncate">{f.name}</p>
              {!isParsing && (
                <button onClick={() => onRemove(i)} className="p-1 rounded hover:bg-theme-border text-theme-muted cursor-pointer" aria-label="Remove">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Per-instrument row ────────────────────────────────────────────────────────

interface InstrumentRow {
  symbol: string
  isin: string
  stcg: number; ltcg: number
  realizedTotal: number
  tradeCharges: number    // sum of per-trade charges (STT, brokerage, etc.) from exit rows
  dividends: number
  qty: number
  unrealizedPnl: number
  currentVal: number
  invested: number
  lots: number
  pnlRecords: ParsedRealizedPnl[]
  divRecords: ParsedDividend[]
  // netProfit = realizedTotal + dividends + unrealizedPnl - tradeCharges
  netProfit: number
}

// ── Expanded row detail ───────────────────────────────────────────────────────

function ExpandedRow({ row }: { row: InstrumentRow }) {
  const exits = [...row.pnlRecords].sort((a, b) => b.exitDate.localeCompare(a.exitDate))
  const divs  = [...row.divRecords].sort((a, b) => b.exDate.localeCompare(a.exDate))

  return (
    <tr>
      <td colSpan={9} className="px-0 py-0">
        <div className="border-t-2 border-indigo-100 bg-indigo-50/30 px-4 py-3 space-y-4">
          {exits.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-theme-muted mb-2">Realized Exits ({exits.length})</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-theme-muted border-b border-theme-border">
                      <th className="px-2 py-1.5 text-left font-medium">Entry</th>
                      <th className="px-2 py-1.5 text-left font-medium">Exit</th>
                      <th className="px-2 py-1.5 text-left font-medium">Type</th>
                      <th className="px-2 py-1.5 text-right font-medium">Qty</th>
                      <th className="px-2 py-1.5 text-right font-medium">Buy Value</th>
                      <th className="px-2 py-1.5 text-right font-medium">Sell Value</th>
                      <th className="px-2 py-1.5 text-right font-medium">Profit</th>
                      <th className="px-2 py-1.5 text-right font-medium">Charges</th>
                      <th className="px-2 py-1.5 text-right font-medium">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exits.map((r, i) => {
                      const rowCharges = r.charges ?? 0
                      const net = r.profit - rowCharges
                      return (
                        <tr key={i} className="border-b border-theme-border/50 last:border-0">
                          <td className="px-2 py-1.5 text-theme-muted">{r.entryDate?.slice(0, 10) ?? '—'}</td>
                          <td className="px-2 py-1.5 text-theme-muted">{r.exitDate?.slice(0, 10) ?? '—'}</td>
                          <td className="px-2 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${holdingTypeBadgeClass(r.holdingType)}`}>
                              {holdingTypeLabel(r.holdingType)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{r.quantity}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-theme-muted">{fmtINR(r.buyValue)}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">{fmtINR(r.sellValue)}</td>
                          <td className={`px-2 py-1.5 text-right tabular-nums font-medium ${pnlCls(r.profit)}`}>
                            {sign(r.profit)}{fmtINR(r.profit)}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums text-rose-600">
                            {rowCharges > 0 ? `-${fmtINR(rowCharges)}` : '—'}
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
          )}
          {divs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-theme-muted mb-2">Dividends ({divs.length})</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-theme-muted border-b border-theme-border">
                      <th className="px-2 py-1.5 text-left font-medium">Ex-Date</th>
                      <th className="px-2 py-1.5 text-right font-medium">Shares</th>
                      <th className="px-2 py-1.5 text-right font-medium">DPS</th>
                      <th className="px-2 py-1.5 text-right font-medium">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divs.map((d, i) => (
                      <tr key={i} className="border-b border-theme-border/50 last:border-0">
                        <td className="px-2 py-1.5 text-theme-muted">{d.exDate?.slice(0, 10) ?? '—'}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{d.quantity}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">₹{d.dividendPerShare.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-amber-600">+{fmtINR(d.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {row.tradeCharges > 0 && (
            <p className="text-xs text-rose-600 font-medium">
              Total trade charges for {row.symbol}: -{fmtINR(row.tradeCharges)} (STT, brokerage, SEBI, stamp duty etc.)
            </p>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Instruments table ─────────────────────────────────────────────────────────

function InstrumentsTable({ rows }: { rows: InstrumentRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!rows.length) return (
    <p className="text-sm text-theme-muted text-center py-12">
      Upload taxpnl-*.xlsx files to see instrument-level breakdown
    </p>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Symbol</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">STCG</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">LTCG</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Realized P&L</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted text-rose-600">Trade Charges</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Dividends</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Unrealized P&L</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Net P&L</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Held</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold text-theme-muted"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const isExp = expanded === r.isin
            return (
              <React.Fragment key={r.isin || r.symbol}>
                <tr
                  onClick={() => setExpanded(isExp ? null : r.isin)}
                  className={`border-b border-theme-border cursor-pointer transition-colors ${isExp ? 'bg-indigo-50' : 'hover:bg-theme-bg-alt/60'}`}
                >
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-theme-text">{r.symbol}</p>
                    {r.lots > 0 && <p className="text-[11px] text-theme-muted">{r.lots} exit{r.lots !== 1 ? 's' : ''}</p>}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${r.stcg !== 0 ? pnlCls(r.stcg) : 'text-theme-muted'}`}>
                    {r.stcg !== 0 ? `${sign(r.stcg)}${fmtINR(r.stcg)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${r.ltcg !== 0 ? pnlCls(r.ltcg) : 'text-theme-muted'}`}>
                    {r.ltcg !== 0 ? `${sign(r.ltcg)}${fmtINR(r.ltcg)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${r.realizedTotal !== 0 ? pnlCls(r.realizedTotal) : 'text-theme-muted'}`}>
                    {r.realizedTotal !== 0 ? `${sign(r.realizedTotal)}${fmtINR(r.realizedTotal)}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-rose-600">
                    {r.tradeCharges > 0 ? `-${fmtINR(r.tradeCharges)}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-amber-600">
                    {r.dividends > 0 ? `+${fmtINR(r.dividends)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${r.unrealizedPnl !== 0 ? pnlCls(r.unrealizedPnl) : 'text-theme-muted'}`}>
                    {r.unrealizedPnl !== 0 ? `${sign(r.unrealizedPnl)}${fmtINR(r.unrealizedPnl)}` : r.qty > 0 ? <span className="text-xs">—</span> : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-right tabular-nums font-bold ${pnlCls(r.netProfit)}`}>
                    {sign(r.netProfit)}{fmtINR(r.netProfit)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.qty > 0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{r.qty}</span>
                      : <span className="text-xs text-theme-muted">Exited</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center text-theme-muted">
                    {isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                </tr>
                {isExp && <ExpandedRow row={r} />}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Summary cards ─────────────────────────────────────────────────────────────

interface SummaryData {
  stcg: number; ltcg: number
  dividends: number; realized: number; unrealized: number
  tradeCharges: number; otherCharges: number
  netProfit: number
}

function SummaryCards({ s }: { s: SummaryData }) {
  const cards = [
    { label: 'STCG',             value: s.stcg,          bg: 'bg-blue-50',    text: 'text-blue-700'    },
    { label: 'LTCG',         value: s.ltcg,      bg: 'bg-purple-50',  text: 'text-purple-700' },
    { label: 'Dividends',    value: s.dividends, bg: 'bg-amber-50',   text: 'text-amber-700'  },
    { label: 'Realized P&L',     value: s.realized,      bg: s.realized  >= 0 ? 'bg-green-50' : 'bg-red-50',  text: s.realized  >= 0 ? 'text-green-700' : 'text-red-600' },
    { label: 'Unrealized P&L',   value: s.unrealized,    bg: s.unrealized >= 0 ? 'bg-green-50' : 'bg-red-50', text: s.unrealized >= 0 ? 'text-green-700' : 'text-red-600' },
    { label: 'Trade Charges',    value: -s.tradeCharges, bg: 'bg-rose-50',    text: 'text-rose-700'    },
    { label: 'Other Debits',     value: -s.otherCharges, bg: 'bg-rose-50',    text: 'text-rose-700'    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-3 ${c.bg}`}>
            <p className="text-xs text-theme-muted">{c.label}</p>
            <p className={`text-sm font-bold mt-0.5 ${c.text}`}>
              {c.value > 0 ? '+' : ''}{fmtINR(c.value)}
            </p>
          </div>
        ))}
      </div>
      {/* Net P&L highlight */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${s.netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div>
          <p className="text-xs text-theme-muted">Net P&L (Realized + Dividends + Unrealized − All Charges)</p>
          <p className={`text-xl font-bold mt-0.5 ${pnlCls(s.netProfit)}`}>{sign(s.netProfit)}{fmtINR(s.netProfit)}</p>
        </div>
        <div className="text-right text-xs text-theme-muted space-y-0.5">
          <p>Trade charges: <span className="text-rose-600 font-medium">-{fmtINR(s.tradeCharges)}</span></p>
          <p>Other debits: <span className="text-rose-600 font-medium">-{fmtINR(s.otherCharges)}</span></p>
        </div>
      </div>
    </div>
  )
}

// ── Other charges breakdown ───────────────────────────────────────────────────

function ChargesBreakdown({ charges }: { charges: ParsedCharge[] }) {
  if (!charges.length) return null

  // Consolidate same accountHead across periods
  const map = new Map<string, number>()
  for (const c of charges) {
    map.set(c.accountHead, (map.get(c.accountHead) ?? 0) + c.amount)
  }
  const rows = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  const total = charges.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-theme-border flex items-center gap-2 bg-theme-bg-alt">
        <Receipt size={14} className="text-rose-500" />
        <p className="text-sm font-semibold text-theme-text">Other Debits &amp; Credits</p>
        <span className="ml-auto text-xs font-bold text-rose-600">-{fmtINR(total)}</span>
      </div>
      <div className="divide-y divide-theme-border">
        {rows.map(([head, amt]) => (
          <div key={head} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-theme-text">{head}</span>
            <span className="text-rose-600 font-medium tabular-nums">-{fmtINR(amt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Broker placeholder ────────────────────────────────────────────────────────

function BrokerPlaceholder({ broker }: { broker: typeof BROKERS[number] }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: broker.color }}>
        {broker.abbr}
      </div>
      <div>
        <p className="text-sm font-semibold text-theme-text">{broker.label} — Coming Soon</p>
        <p className="text-xs text-theme-muted mt-1">Upload support for {broker.label} will be added here</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface ParsedState {
  realizedPnl: ParsedRealizedPnl[]
  dividends: ParsedDividend[]
  holdings: ParsedHolding[]
  charges: ParsedCharge[]        // Other Debits and Credits (AMC etc.)
}

export default function TaxPnlPage() {
  const [broker, setBroker] = useState<Broker>('zerodha')
  const [files, setFiles] = useState<File[]>([])
  const [preset, setPreset] = useState<RangePreset>('ALL')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [parsed, setParsed] = useState<ParsedState | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const parseFiles = useParseFiles()
  const saveTaxPnl = useSaveTaxPnl()
  const deleteTaxPnl = useDeleteTaxPnl()

  const handleDelete = () => {
    const brokerKey = broker.toUpperCase()
    if (!window.confirm(`Delete ALL saved ${brokerKey} records (realized P&L, dividends, charges, holdings)? This cannot be undone.`)) return
    setSaveMsg(null)
    deleteTaxPnl.mutate(brokerKey, {
      onSuccess: (r) => setSaveMsg(`Deleted ${brokerKey} — ${r.realizedPnl} exits · ${r.dividends} dividends · ${r.charges} charges · ${r.holdings} holdings. You can re-upload now.`),
      onError: (e) => setSaveMsg(`Error: ${e.message}`),
    })
  }

  const addFiles = (incoming: File[]) => {
    const existing = new Set(files.map(f => f.name))
    setFiles(prev => [...prev, ...incoming.filter(f => !existing.has(f.name))])
    setParsed(null)
    parseFiles.reset()
  }

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setParsed(null)
  }

  const handleParse = () => {
    if (!files.length) return
    parseFiles.mutate(files, {
      onSuccess: results => {
        const merged = mergeParseResults(results)
        setParsed({
          realizedPnl: merged.realizedPnl,
          dividends: merged.dividends,
          holdings: merged.holdings,
          charges: merged.charges,
        })
      },
    })
  }

  const handleSave = async () => {
    if (!parsed || isSaving) return
    setIsSaving(true)
    setSaveMsg(null)

    const BATCH = 10
    const brokerKey = broker.toUpperCase()
    const totals = {
      realizedPnl: 0, dividends: 0, charges: 0, holdings: 0,
      realizedPnlUpd: 0, dividendsUpd: 0, chargesUpd: 0, holdingsUpd: 0,
    }

    function chunk<T>(arr: T[]): T[][] {
      const out: T[][] = []
      for (let i = 0; i < arr.length; i += BATCH) out.push(arr.slice(i, i + BATCH))
      return out.length ? out : [[]]
    }

    try {
      const pnlChunks  = chunk(parsed.realizedPnl)
      const divChunks  = chunk(parsed.dividends)
      const chgChunks  = chunk(parsed.charges)
      const hldChunks  = chunk(parsed.holdings)
      const batchCount = Math.max(pnlChunks.length, divChunks.length, chgChunks.length, hldChunks.length)

      for (let i = 0; i < batchCount; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 2000))
        setSaveMsg(`Saving batch ${i + 1} of ${batchCount}…`)
        await new Promise<void>((resolve, reject) =>
          saveTaxPnl.mutate(
            {
              broker: brokerKey,
              realizedPnl: pnlChunks[i] ?? [],
              dividends:   divChunks[i] ?? [],
              charges:     chgChunks[i] ?? [],
              holdings:    hldChunks[i] ?? [],
            },
            {
              onSuccess: (r) => {
                totals.realizedPnl    += r.realizedPnl.created
                totals.dividends      += r.dividends.created
                totals.charges        += r.charges.created
                totals.holdings       += r.holdings.created
                totals.realizedPnlUpd += r.realizedPnl.updated
                totals.dividendsUpd   += r.dividends.updated
                totals.chargesUpd     += r.charges.updated
                totals.holdingsUpd    += r.holdings.updated
                resolve()
              },
              onError: (err) => reject(err),
            }
          )
        )
      }

      const created = totals.realizedPnl + totals.dividends + totals.charges + totals.holdings
      const updated = totals.realizedPnlUpd + totals.dividendsUpd + totals.chargesUpd + totals.holdingsUpd
      if (created === 0 && updated === 0) {
        setSaveMsg('Nothing saved — all records already up to date (duplicate upload)')
      } else if (created === 0) {
        setSaveMsg(`Updated ${updated} existing records — no new data found`)
      } else {
        setSaveMsg(`Saved — ${totals.realizedPnl} new exits · ${totals.dividends} new dividends · ${totals.charges} new charges · ${totals.holdings} new holdings${updated > 0 ? ` · ${updated} updated` : ''}`)
      }
      setTimeout(() => setSaveMsg(null), 8000)
    } catch (err) {
      setSaveMsg(`Error: ${(err as Error).message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const activeRange = useMemo<DateRange | null>(() => {
    if (preset === 'CUSTOM') return customFrom && customTo ? { from: customFrom, to: customTo } : null
    return PRESETS.find(p => p.id === preset)?.range ?? null
  }, [preset, customFrom, customTo])

  // Strip NSE corporate-action suffixes: HCLTECH# → HCLTECH, BAJFINANCE6 → BAJFINANCE
  // Only strips a trailing # or a SINGLE trailing digit (not MON100, NIFTY50, etc.)
  const normalizeSymbol = (sym: string) => sym.replace(/#$/, '').replace(/\d$/, (d, offset) => {
    // Only strip if the base without the digit is a valid instrument name (len > 2)
    return offset >= 3 ? '' : d
  })

  // Build per-instrument rows with 3-tier ISIN resolution to prevent double-counting
  const filteredDivs = useMemo<ParsedDividend[]>(() => {
    if (!parsed) return []
    return parsed.dividends.filter(d => inRange(d.exDate, activeRange))
  }, [parsed, activeRange])

  const { tradedRows, dividendOnlyRows } = useMemo(() => {
    if (!parsed) return { tradedRows: [] as InstrumentRow[], dividendOnlyRows: [] as InstrumentRow[] }
    const { realizedPnl, dividends, holdings } = parsed

    const filteredRpnl = realizedPnl.filter(r => inRange(r.exitDate, activeRange))
    const filteredDivs  = dividends.filter(d => inRange(d.exDate, activeRange))

    const map = new Map<string, InstrumentRow>()

    const newRow = (symbol: string, isin: string): InstrumentRow => ({
      symbol, isin, stcg: 0, ltcg: 0,
      realizedTotal: 0, tradeCharges: 0, dividends: 0,
      qty: 0, unrealizedPnl: 0, currentVal: 0, invested: 0, lots: 0,
      pnlRecords: [], divRecords: [], netProfit: 0,
    })

    // Pass 1 — all realized P&L entries (canonical ISINs from Tradewise Exits)
    for (const r of filteredRpnl) {
      const key = r.isin || r.symbol
      if (!map.has(key)) map.set(key, newRow(r.symbol, r.isin))
      const e = map.get(key)!
      const ht = r.holdingType as string
      if      (ht === 'STCG'  || ht === 'NON_EQ_STCG' || ht === 'INTRADAY') e.stcg += r.profit
      else if (ht === 'LTCG'  || ht === 'NON_EQ_LTCG')                      e.ltcg += r.profit
      e.realizedTotal += r.profit
      e.tradeCharges  += r.charges ?? 0
      e.lots++
      e.pnlRecords.push(r)
    }

    // Build reverse lookup: ISIN → key, symbol → key (for dividend resolution)
    const isinToKey   = new Map<string, string>()
    const symbolToKey = new Map<string, string>()
    for (const [key, row] of map) {
      if (row.isin)   isinToKey.set(row.isin, key)
      symbolToKey.set(row.symbol, key)
      // Also index the normalized symbol
      const norm = normalizeSymbol(row.symbol)
      if (norm !== row.symbol) symbolToKey.set(norm, key)
    }

    // Pass 2 — dividends: 3-tier resolution
    //   Tier 1: exact ISIN match
    //   Tier 2: exact symbol match (same name, different ISIN — post-corporate-action)
    //   Tier 3: normalized symbol match (HCLTECH# → HCLTECH, BAJFINANCE6 → BAJFINANCE)
    for (const d of filteredDivs) {
      let key: string | undefined

      // Tier 1
      key = d.isin ? isinToKey.get(d.isin) : undefined
      // Tier 2
      if (!key) key = symbolToKey.get(d.symbol)
      // Tier 3
      if (!key) key = symbolToKey.get(normalizeSymbol(d.symbol))

      if (!key) {
        // No existing entry — create new one (dividend-only instrument)
        key = d.isin || d.symbol
        map.set(key, newRow(d.symbol, d.isin))
        if (d.isin)   isinToKey.set(d.isin, key)
        symbolToKey.set(d.symbol, key)
      }

      const e = map.get(key)!
      e.dividends += d.netAmount
      e.divRecords.push(d)
    }

    // Merge holdings snapshot (unfiltered — shows current position)
    for (const h of holdings) {
      const hKey = h.isin ? isinToKey.get(h.isin) : symbolToKey.get(h.symbol)
      const e = hKey ? map.get(hKey) : undefined
      if (e) {
        e.qty           = h.quantityAvailable
        e.unrealizedPnl = h.unrealizedPnl
        e.currentVal    = h.quantityAvailable * h.currentPrice
        e.invested      = h.quantityAvailable * h.avgPrice
        e.symbol        = h.symbol
      }
    }

    const all = Array.from(map.values()).map(r => ({
      ...r,
      netProfit: r.realizedTotal + r.dividends + r.unrealizedPnl - r.tradeCharges,
    }))

    // Split: instruments with exits → main table; dividend-only (no trades) → separate table
    const traded      = all.filter(r => r.lots > 0).sort((a, b) => Math.abs(b.netProfit) - Math.abs(a.netProfit))
    const divOnly     = all.filter(r => r.lots === 0 && r.dividends > 0).sort((a, b) => b.dividends - a.dividends)

    return { tradedRows: traded, dividendOnlyRows: divOnly }
  }, [parsed, activeRange])

  // Filter other charges by date range too
  const filteredCharges = useMemo<ParsedCharge[]>(() => {
    if (!parsed) return []
    return parsed.charges.filter(c => inRange(c.periodFrom, activeRange) || inRange(c.periodTo, activeRange))
  }, [parsed, activeRange])

  const allRows = useMemo(() => [...tradedRows, ...dividendOnlyRows], [tradedRows, dividendOnlyRows])

  const summary = useMemo<SummaryData>(() => {
    const otherCharges = filteredCharges.reduce((s, c) => s + c.amount, 0)
    const tradeCharges = allRows.reduce((s, r) => s + r.tradeCharges, 0)
    const realized     = allRows.reduce((s, r) => s + r.realizedTotal, 0)
    const dividends    = allRows.reduce((s, r) => s + r.dividends, 0)
    const unrealized   = allRows.reduce((s, r) => s + r.unrealizedPnl, 0)
    return {
      stcg:     allRows.reduce((s, r) => s + r.stcg, 0),
      ltcg:     allRows.reduce((s, r) => s + r.ltcg, 0),
      dividends, realized, unrealized, tradeCharges, otherCharges,
      netProfit: realized + dividends + unrealized - tradeCharges - otherCharges,
    }
  }, [allRows, filteredCharges])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <BarChart2 size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-theme-text">Tax P&L</h1>
          <p className="text-xs text-theme-muted">Upload broker tax reports — realized P&L, dividends, charges across all instruments</p>
        </div>
      </div>

      {/* Broker tabs + upload panel */}
      <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
        <div className="flex border-b border-theme-border overflow-x-auto">
          {BROKERS.map(b => (
            <button
              key={b.id}
              onClick={() => { setBroker(b.id); setFiles([]); setParsed(null); parseFiles.reset() }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0
                ${broker === b.id ? 'border-b-2 text-theme-text bg-white' : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt'}`}
              style={broker === b.id ? { borderBottomColor: b.color } : {}}
            >
              <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: b.color }}>
                {b.abbr}
              </span>
              {b.label}
            </button>
          ))}
        </div>

        {broker !== 'zerodha' && broker !== 'hdfc' && broker !== 'angel' && broker !== 'groww' && broker !== 'yesbank' ? (
          <BrokerPlaceholder broker={BROKERS.find(b => b.id === broker)!} />
        ) : (
          <div className="p-4 space-y-4">
            {broker === 'groww' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800 space-y-0.5">
                <p className="font-semibold">Groww — Supported files</p>
                <p>• <strong>Stocks_Capital_Gains_Report_*.xlsx</strong> — capital gains with charges (Groww app → Reports → Capital Gains)</p>
                <p>• <strong>Dividend_Report_*.pdf</strong> — dividend income (Groww app → Reports → Dividend)</p>
                <p className="text-green-600 mt-1">Upload multiple files: e.g. both FY25 and FY26 capital gains + both dividend PDFs together.</p>
              </div>
            )}
            {broker === 'hdfc' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-0.5">
                <p className="font-semibold">HDFC Sky — Supported files</p>
                <p>• <strong>Profit &amp; Loss.xlsx</strong> — download from HDFC Sky app → Reports → P&amp;L</p>
                <p className="text-blue-500 mt-1">Holdings PDF not required — P&amp;L data is enough to populate your portfolio history.</p>
              </div>
            )}
            {broker === 'angel' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-0.5">
                <p className="font-semibold">Angel One — Supported files</p>
                <p>• <strong>Tax PNL *.xlsx</strong> — download from Angel One → Reports → Tax P&amp;L → Export</p>
                <p className="text-amber-600 mt-1">Parses "Equity+Bonds+SGB Trade Details" tab: intraday trades, delivery P&amp;L, charges, and dividends.</p>
              </div>
            )}
            {broker === 'yesbank' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-0.5">
                <p className="font-semibold">Yes Bank — Supported files</p>
                <p>• <strong>CapitalGain_Loss_*.xlsx</strong> — download from Yes Bank/Yes Securities → Reports → Capital Gain/Loss Statement</p>
                <p className="text-slate-600 mt-1">Parses per-trade STCG/LTCG/Intraday gains and per-trade charges (GST, Brokerage, Misc., STT/CTT) by ISIN.</p>
              </div>
            )}
            <FileDropZone files={files} onAdd={addFiles} onRemove={removeFile} isParsing={parseFiles.isPending} />
            {parseFiles.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{parseFiles.error?.message}</p>
              </div>
            )}
            {files.length > 0 && !parsed && (
              <button
                onClick={handleParse}
                disabled={parseFiles.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
              >
                {parseFiles.isPending
                  ? <><Loader2 size={14} className="animate-spin" />Parsing {files.length} file{files.length > 1 ? 's' : ''}…</>
                  : <><Upload size={14} />Analyse {files.length} file{files.length > 1 ? 's' : ''}</>}
              </button>
            )}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-theme-border mt-1">
              <p className="text-xs text-theme-muted">Wrong or stale {broker.toUpperCase()} data? Delete it, then re-upload.</p>
              <button
                onClick={handleDelete}
                disabled={deleteTaxPnl.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-60 cursor-pointer shrink-0"
              >
                {deleteTaxPnl.isPending
                  ? <><Loader2 size={12} className="animate-spin" />Deleting…</>
                  : <><Trash2 size={12} />Delete {broker.toUpperCase()} data</>}
              </button>
            </div>
            {saveMsg && !parsed && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {!saveMsg.startsWith('Error') && <CheckCircle2 size={13} />}
                {saveMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {parsed && (
        <div className="space-y-4">
          {/* Period filter */}
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
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-theme-muted">
                {tradedRows.length} traded · {tradedRows.filter(r => r.qty === 0).length} exited · {tradedRows.filter(r => r.qty > 0).length} holding · {dividendOnlyRows.length} div-only
              </span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {isSaving
                  ? <><Loader2 size={12} className="animate-spin" />Saving…</>
                  : <><Save size={12} />Save</>}
              </button>
            </div>
          </div>

          {saveMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {!saveMsg.startsWith('Error') && <CheckCircle2 size={13} />}
              {saveMsg}
            </div>
          )}

          {/* Summary */}
          <SummaryCards s={summary} />

          {/* Traded instruments table */}
          <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-theme-border flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-500" />
              <p className="text-sm font-semibold text-theme-text">Traded Instruments</p>
              <span className="text-xs text-theme-muted ml-1">Click row to expand exits, dividends &amp; charges</span>
              <div className="ml-auto flex items-center gap-3 text-xs text-theme-muted">
                <span className="flex items-center gap-1"><TrendingUp size={11} className="text-green-600" /> Profit</span>
                <span className="flex items-center gap-1"><TrendingDown size={11} className="text-red-500" /> Loss</span>
                <span className="flex items-center gap-1"><Gift size={11} className="text-amber-500" /> Dividend</span>
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <InstrumentsTable rows={tradedRows} />
            </div>
          </div>

          {/* All dividends — shown whenever any dividends exist in the filtered period */}
          {filteredDivs.length > 0 && (
            <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border flex items-center gap-2 bg-amber-50">
                <Gift size={14} className="text-amber-600" />
                <p className="text-sm font-semibold text-theme-text">Dividend Income</p>
                <span className="text-xs text-theme-muted ml-1">{filteredDivs.length} payment{filteredDivs.length !== 1 ? 's' : ''}</span>
                <span className="ml-auto text-sm font-bold text-amber-600">
                  +{fmtINR(filteredDivs.reduce((s, d) => s + d.netAmount, 0))}
                </span>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-theme-muted">Symbol</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">ISIN</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Ex-Date</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Qty</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">DPS</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredDivs].sort((a, b) => b.exDate.localeCompare(a.exDate)).map((d, i) => (
                      <tr key={`${d.isin}|${d.exDate}|${i}`} className="border-b border-theme-border last:border-0 hover:bg-theme-bg-alt/50">
                        <td className="px-4 py-2.5 font-semibold text-theme-text">{d.symbol}</td>
                        <td className="px-3 py-2.5 text-xs text-theme-muted">{d.isin}</td>
                        <td className="px-3 py-2.5 text-xs text-theme-muted whitespace-nowrap">{d.exDate?.slice(0, 10)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{d.quantity}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">₹{d.dividendPerShare.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-amber-600">+{fmtINR(d.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other Debits & Credits breakdown */}
          {filteredCharges.length > 0 && <ChargesBreakdown charges={filteredCharges} />}
        </div>
      )}
    </div>
  )
}
