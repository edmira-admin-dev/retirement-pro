import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStockResearchStore } from '../stores/stockResearchStore'
import { useStockHoldings } from '../hooks/useTradeBook'
import { useLTP } from '../hooks/useMarket'
import { parseResearchDoc } from '../utils/parseResearchDoc'
import { parseExecutiveSummary } from '../utils/parseSnapshot'
import { parseScorecard } from '../utils/parseScorecard'
import { parseScenarios } from '../utils/parseScenarios'
import { ResearchHeader } from '../components/research/ResearchHeader'
import { StockSidebar } from '../components/research/StockSidebar'
import { StockTabsPanel } from '../components/research/StockTabsPanel'
import { UploadAnalysisPanel } from '../components/research/UploadAnalysisPanel'

export default function StockResearchPage () {
  const { ticker: tickerParam } = useParams<{ ticker?: string }>()
  const navigate = useNavigate()
  const [query, setQuery] = useState(tickerParam ?? '')

  const ticker = (tickerParam ?? '').toUpperCase().trim()
  const docs = useStockResearchStore(s => s.docs)
  const setDoc = useStockResearchStore(s => s.setDoc)
  const doc = ticker ? docs[ticker] : undefined

  const holdings = useStockHoldings()

  const ltp = useLTP(ticker ? [ticker] : [])
  const liveLtp = ltp.isLoading ? undefined : (ltp.data?.data[ticker] ?? null)

  const parsed = useMemo(() => (doc ? parseResearchDoc(doc.content) : null), [doc])

  const execSection = parsed?.sections.find(s => s.id === '0')
  const scorecardSection = parsed?.sections.find(s => s.id === '13')
  const scenarioSection = parsed?.sections.find(s => s.id === '12')

  const execSummary = useMemo(() => (execSection ? parseExecutiveSummary(execSection.content) : null), [execSection])
  const scorecard = useMemo(() => (scorecardSection ? parseScorecard(scorecardSection.content) : null), [scorecardSection])
  const scenarios = useMemo(() => (scenarioSection ? parseScenarios(scenarioSection.content) : null), [scenarioSection])

  const tabSections = useMemo(
    () => (parsed?.sections ?? []).filter(s => !['0', '12', '13'].includes(s.id)),
    [parsed],
  )

  function submitSearch (e: React.FormEvent) {
    e.preventDefault()
    const t = query.trim().toUpperCase()
    if (t) navigate(`/stock/${t}`)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-theme-text">Stock Research</h1>
        <p className="text-sm text-theme-muted mt-0.5">Search a ticker for its research dashboard — CMP, business model, analysis, and your position.</p>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker, e.g. BEL"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-theme-border bg-theme-card text-sm text-theme-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          View
        </button>
      </form>

      {Object.keys(docs).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-theme-muted">Loaded:</span>
          {Object.values(docs).map(d => (
            <button
              key={d.ticker}
              onClick={() => navigate(`/stock/${d.ticker}`)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                d.ticker === ticker ? 'bg-theme-primary text-white' : 'bg-theme-bg-alt text-theme-text-sec hover:bg-theme-border'
              }`}
            >
              {d.ticker}
            </button>
          ))}
        </div>
      )}

      {!ticker ? (
        <div className="text-center py-16 text-sm text-theme-muted">Search a ticker above to get started.</div>
      ) : !doc || !parsed ? (
        <UploadAnalysisPanel ticker={ticker} onUpload={(fileName, content) => setDoc(ticker, fileName, content)} />
      ) : (
        <div className="space-y-4">
          <ResearchHeader
            ticker={ticker}
            doc={parsed}
            liveLtp={liveLtp}
            onReplace={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.md'
              input.onchange = async () => {
                const file = input.files?.[0]
                if (file) setDoc(ticker, file.name, await file.text())
              }
              input.click()
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
            <StockSidebar
              ticker={ticker}
              snapshot={parsed.snapshot}
              extraSnapshot={execSummary?.snapshot ?? []}
              holdings={holdings.data ?? []}
              isLoading={holdings.isLoading}
              isError={holdings.isError}
            />

            <StockTabsPanel
              summary={execSummary?.summary}
              scorecard={scorecard}
              scorecardTitle={scorecardSection?.title}
              scenarios={scenarios}
              scenariosTitle={scenarioSection?.title}
              sections={tabSections}
            />
          </div>
        </div>
      )}
    </div>
  )
}
