import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ScorecardEntry } from '../../hooks/useFactorScorecard'
import { recommendationBadgeCls } from './factorLabels'

interface Props {
  entries: ScorecardEntry[]
}

interface SectorGroup {
  sector: string
  count: number
  avgScore: number
  topTicker: string
  topScore: number
  stocks: ScorecardEntry[]
}

function groupBySector(entries: ScorecardEntry[]): SectorGroup[] {
  const map = new Map<string, ScorecardEntry[]>()
  for (const e of entries) {
    const key = e.sector || 'Unclassified'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return Array.from(map.entries())
    .map(([sector, stocks]) => {
      const sorted = [...stocks].sort((a, b) => b.score - a.score)
      const avgScore = stocks.reduce((s, e) => s + e.score, 0) / stocks.length
      return { sector, count: stocks.length, avgScore, topTicker: sorted[0].ticker, topScore: sorted[0].score, stocks: sorted }
    })
    .sort((a, b) => b.avgScore - a.avgScore)
}

export function SectorSummaryTable({ entries }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const groups = useMemo(() => groupBySector(entries), [entries])

  if (!groups.length) {
    return <p className="text-sm text-theme-muted text-center py-16">No stocks match the current filters</p>
  }

  const maxAvg = groups[0].avgScore || 1

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-3 py-2.5 w-8" />
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Sector</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold text-theme-muted">Stocks</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted w-40">Avg Score</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Top Stock</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const isExp = expanded === g.sector
            return (
              <React.Fragment key={g.sector}>
                <tr
                  onClick={() => setExpanded(isExp ? null : g.sector)}
                  className={`border-b border-theme-border cursor-pointer transition-colors ${isExp ? 'bg-indigo-50' : 'hover:bg-theme-bg-alt/60'}`}
                >
                  <td className="px-3 py-2.5 text-theme-muted">{isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</td>
                  <td className="px-3 py-2.5 font-semibold text-theme-text">{g.sector}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-theme-muted">{g.count}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-theme-bg-alt overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${(g.avgScore / maxAvg) * 100}%` }} />
                      </div>
                      <span className="font-bold text-theme-text tabular-nums w-10 text-right">{g.avgScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-theme-muted">
                    <span className="font-semibold text-theme-text">{g.topTicker}</span> ({g.topScore.toFixed(1)})
                  </td>
                </tr>
                {isExp && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="border-t-2 border-indigo-100 bg-indigo-50/30 px-4 py-2 space-y-1">
                        {g.stocks.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-xs py-1">
                            <span className="font-semibold text-theme-text w-24 shrink-0">{s.ticker}</span>
                            <span className="text-theme-muted flex-1">{s.universe === 'NIFTY_MIDCAP150' ? 'Nifty Midcap 150' : 'Nifty 100'}</span>
                            <span className="tabular-nums font-medium text-theme-text w-12 text-right">{s.score.toFixed(1)}</span>
                            <span className={`ml-3 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${recommendationBadgeCls(s.recommendation)}`}>
                              {s.recommendation}
                            </span>
                          </div>
                        ))}
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
