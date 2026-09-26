import { useRef, useState } from 'react'
import { Upload, FilePlus, FileText, X, Loader2, AlertCircle, CheckCircle2, Save } from 'lucide-react'
import {
  useParseEquityHoldingsFile, useSaveEquityHoldings,
  type EquityHoldingsParseResult,
} from '../../hooks/useEquityHoldings'

interface Props {
  onClose: () => void
  onSaved: (asOfDate: string) => void
}

// ── File drop zone ───────────────────────────────────────────────────────────

function FileDropZone ({ file, onSelect, onRemove, disabled }: {
  file: File | null; onSelect: (f: File) => void; onRemove: () => void; disabled: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const pick = (list: FileList | null) => { if (list?.[0]) onSelect(list[0]) }

  if (file) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-theme-bg-alt rounded-lg">
        <FileText size={14} className="text-indigo-500 shrink-0" />
        <p className="flex-1 text-sm text-theme-text truncate">{file.name}</p>
        {!disabled && (
          <button onClick={onRemove} className="p-1 rounded hover:bg-theme-border text-theme-muted cursor-pointer" aria-label="Remove">
            <X size={13} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors
        ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-theme-border hover:border-indigo-300 hover:bg-theme-bg-alt'}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
    >
      <input ref={inputRef} type="file" className="hidden" accept=".csv" onChange={e => { pick(e.target.files); e.target.value = '' }} />
      <FilePlus size={24} className="text-theme-muted" />
      <p className="text-sm font-medium text-theme-text">Drop your Tickertape Holdings CSV or click to add</p>
      <p className="text-xs text-theme-muted">tickertape.in/portfolio → Holdings → Export CSV (works across all your brokers)</p>
    </div>
  )
}

// ── Preview table ─────────────────────────────────────────────────────────────

function fmtPrice (n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct (n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function pnlColor (n: number) {
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-theme-muted'
}

function PreviewTable ({ result }: { result: EquityHoldingsParseResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">As of {result.asOfDate}</span>
        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">{result.newCount} new</span>
        {result.duplicateCount > 0 && (
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">{result.duplicateCount} will update</span>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border border-theme-border max-h-[320px] overflow-y-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-theme-muted whitespace-nowrap">Company</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-theme-muted whitespace-nowrap">Symbol</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-theme-muted whitespace-nowrap">Sector</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-theme-muted whitespace-nowrap">Industry</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Avg Cost</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Weight%</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">LTP</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Invested</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Current</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">P&L</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Net Chg%</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Day Chg</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-theme-muted whitespace-nowrap">Day Chg%</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-theme-muted"></th>
            </tr>
          </thead>
          <tbody>
            {result.holdings.map(h => (
              <tr key={h.symbol} className="border-b border-theme-border last:border-0">
                <td className="px-3 py-2 font-semibold text-theme-text whitespace-nowrap">{h.companyName}</td>
                <td className="px-3 py-2 text-theme-muted whitespace-nowrap">{h.symbol}</td>
                <td className="px-3 py-2 text-theme-muted whitespace-nowrap">{h.sector}</td>
                <td className="px-3 py-2 text-theme-muted whitespace-nowrap">{h.industry}</td>
                <td className="px-3 py-2 text-right tabular-nums">{h.quantity}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtPrice(h.avgCost)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{h.portfolioWeightPct.toFixed(2)}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtPrice(h.ltp)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtPrice(h.investedValue)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtPrice(h.currentValue)}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-medium ${pnlColor(h.pnl)}`}>{fmtPrice(h.pnl)}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${pnlColor(h.pnlPct)}`}>{fmtPct(h.pnlPct)}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${pnlColor(h.dayChange)}`}>{fmtPrice(h.dayChange)}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${pnlColor(h.dayChangePct)}`}>{fmtPct(h.dayChangePct)}</td>
                <td className="px-3 py-2 text-center">
                  {h.isDuplicate
                    ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">UPDATE</span>
                    : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">NEW</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function UploadHoldingsModal ({ onClose, onSaved }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<EquityHoldingsParseResult | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const parseFile = useParseEquityHoldingsFile()
  const saveHoldings = useSaveEquityHoldings()

  const handleSelect = (f: File) => { setFile(f); setParsed(null); parseFile.reset() }
  const handleRemove = () => { setFile(null); setParsed(null); parseFile.reset() }

  const handleParse = () => {
    if (!file) return
    parseFile.mutate(file, { onSuccess: setParsed })
  }

  const handleSave = () => {
    if (!parsed) return
    setSaveMsg(null)
    saveHoldings.mutate(parsed.holdings, {
      onSuccess: (r) => {
        setSaveMsg(`Saved — ${r.created} new · ${r.updated} updated`)
        setTimeout(() => onSaved(parsed.asOfDate), 900)
      },
      onError: (e) => setSaveMsg(`Error: ${e.message}`),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-theme-card border border-theme-border rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border sticky top-0 bg-theme-card">
          <div>
            <p className="font-semibold text-theme-text text-sm">Upload Holdings CSV</p>
            <p className="text-xs text-theme-muted">Tickertape export — works across all your brokers</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-theme-muted hover:bg-theme-bg-alt transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <FileDropZone file={file} onSelect={handleSelect} onRemove={handleRemove} disabled={parseFile.isPending} />

          {parseFile.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{parseFile.error?.message}</p>
            </div>
          )}

          {file && !parsed && (
            <button
              onClick={handleParse}
              disabled={parseFile.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
            >
              {parseFile.isPending ? <><Loader2 size={14} className="animate-spin" />Parsing…</> : <><Upload size={14} />Analyse file</>}
            </button>
          )}

          {parsed && (
            <div className="space-y-3">
              <PreviewTable result={parsed} />
              <button
                onClick={handleSave}
                disabled={saveHoldings.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
              >
                {saveHoldings.isPending ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Save size={14} />Save {parsed.holdings.length} holdings for {parsed.asOfDate}</>}
              </button>
            </div>
          )}

          {saveMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {!saveMsg.startsWith('Error') && <CheckCircle2 size={13} />}
              {saveMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
