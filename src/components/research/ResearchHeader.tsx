import { RefreshCw, Upload } from 'lucide-react'
import type { ParsedResearchDoc } from '../../utils/parseResearchDoc'

interface ResearchHeaderProps {
  ticker: string
  doc: ParsedResearchDoc
  liveLtp: number | null | undefined
  onReplace: () => void
}

function recoClasses (reco?: string) {
  const r = (reco ?? '').toLowerCase()
  if (r.includes('overweight') || r.includes('buy')) return 'bg-green-50 text-green-700 border-green-200'
  if (r.includes('underweight') || r.includes('sell') || r.includes('reduce')) return 'bg-red-50 text-red-600 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

export function ResearchHeader ({ ticker, doc, liveLtp, onReplace }: ResearchHeaderProps) {
  const { snapshot } = doc

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-bold text-theme-text">{ticker}</h1>
          {snapshot.recommendation && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${recoClasses(snapshot.recommendation)}`}>
              {snapshot.recommendation}
            </span>
          )}
        </div>
        <p className="text-xs text-theme-muted mt-0.5">{doc.companyName}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-theme-muted">Live LTP</p>
          <p className="text-xl font-bold text-theme-text mt-0.5 flex items-center gap-1.5 justify-end">
            {liveLtp === undefined ? (
              <RefreshCw size={14} className="animate-spin text-theme-muted" />
            ) : liveLtp === null ? (
              <span className="text-theme-muted text-sm">—</span>
            ) : (
              `₹${liveLtp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </p>
        </div>
        <button
          onClick={onReplace}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer shrink-0"
        >
          <Upload size={12} /> Replace
        </button>
      </div>
    </div>
  )
}
