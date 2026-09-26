import { useMemo, useState } from 'react'
import { LineChart, Search } from 'lucide-react'
import { useFactorScorecardData, type ScorecardEntry } from '../hooks/useFactorScorecard'
import { ScorecardUploadZone } from '../components/factorScorecard/ScorecardUploadZone'
import { ScorecardTable } from '../components/factorScorecard/ScorecardTable'
import { SectorSummaryTable } from '../components/factorScorecard/SectorSummaryTable'
import { universeLabel } from '../components/factorScorecard/factorLabels'

// AI-run panel (FundamentalsUploadZone + RunStatusBanner) is built but hidden for now — not in use yet.

type SortKey = 'score' | 'cmp' | 'rank'

export default function FactorScorecardPage() {
  const { data, isLoading } = useFactorScorecardData()
  const [universe, setUniverse] = useState<'ALL' | 'NIFTY100' | 'NIFTY_MIDCAP150'>('ALL')
  const [recommendation, setRecommendation] = useState('ALL')
  const [runDate, setRunDate] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [view, setView] = useState<'stocks' | 'sectors'>('stocks')

  const entries = data?.entries ?? []

  const runDates = useMemo(() => Array.from(new Set(entries.map((e) => e.runDate))).sort().reverse(), [entries])
  const recommendations = useMemo(() => Array.from(new Set(entries.map((e) => e.recommendation))).sort(), [entries])

  const filtered = useMemo(() => {
    let rows = entries
    if (universe !== 'ALL') rows = rows.filter((e) => e.universe === universe)
    if (recommendation !== 'ALL') rows = rows.filter((e) => e.recommendation === recommendation)
    if (runDate !== 'ALL') rows = rows.filter((e) => e.runDate === runDate)
    if (search.trim()) {
      const q = search.trim().toUpperCase()
      rows = rows.filter((e) => e.ticker.includes(q) || e.sector.toUpperCase().includes(q))
    }
    const sorted = [...rows].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number)
      return sortDir === 'asc' ? diff : -diff
    })
    return sorted
  }, [entries, universe, recommendation, runDate, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <LineChart size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-theme-text">Factor Scorecard</h1>
          <p className="text-xs text-theme-muted">10-factor weighted stock scorecard across Nifty 100 and Nifty Midcap 150</p>
        </div>
      </div>

      <ScorecardUploadZone uploads={data?.uploads ?? []} />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <LineChart size={32} className="text-theme-muted" />
          <p className="text-sm font-medium text-theme-text">No scorecard data yet</p>
          <p className="text-xs text-theme-muted">Upload a Nifty 100 or Nifty Midcap 150 factor scorecard .xlsx to get started</p>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="bg-theme-card border border-theme-border rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-theme-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                placeholder="Search ticker or sector"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs border border-theme-border rounded-lg pl-7 pr-3 py-1.5 bg-white text-theme-text w-48"
              />
            </div>

            <select value={universe} onChange={(e) => setUniverse(e.target.value as typeof universe)}
              className="text-xs border border-theme-border rounded-lg px-2 py-1.5 bg-white text-theme-text">
              <option value="ALL">All Universes</option>
              <option value="NIFTY100">{universeLabel('NIFTY100')}</option>
              <option value="NIFTY_MIDCAP150">{universeLabel('NIFTY_MIDCAP150')}</option>
            </select>

            <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)}
              className="text-xs border border-theme-border rounded-lg px-2 py-1.5 bg-white text-theme-text">
              <option value="ALL">All Recommendations</option>
              {recommendations.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={runDate} onChange={(e) => setRunDate(e.target.value)}
              className="text-xs border border-theme-border rounded-lg px-2 py-1.5 bg-white text-theme-text">
              <option value="ALL">All Run Dates</option>
              {runDates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <div className="flex items-center gap-1 bg-theme-bg-alt border border-theme-border rounded-lg p-0.5">
              <button
                onClick={() => setView('stocks')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${view === 'stocks' ? 'bg-theme-card shadow-sm text-theme-text' : 'text-theme-muted'}`}
              >
                By Stock
              </button>
              <button
                onClick={() => setView('sectors')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${view === 'sectors' ? 'bg-theme-card shadow-sm text-theme-text' : 'text-theme-muted'}`}
              >
                By Sector
              </button>
            </div>

            <span className="ml-auto text-xs text-theme-muted">{filtered.length} of {entries.length} stocks</span>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {view === 'stocks'
              ? <ScorecardTable entries={filtered as ScorecardEntry[]} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              : <SectorSummaryTable entries={filtered as ScorecardEntry[]} />}
          </div>
        </div>
      )}
    </div>
  )
}
