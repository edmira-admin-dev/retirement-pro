import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import type { ScorecardEntry } from '../../hooks/useFactorScorecard'
import { recommendationBadgeCls, universeLabel } from './factorLabels'
import { FactorDetailCards } from './FactorDetailCards'

interface Props {
  entries: ScorecardEntry[]
  sortKey: 'score' | 'cmp' | 'rank'
  sortDir: 'asc' | 'desc'
  onSort: (key: 'score' | 'cmp' | 'rank') => void
}

function SortHeader({ label, active, dir, onClick, align = 'right' }: { label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void; align?: 'left' | 'right' }) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-2.5 text-xs font-semibold text-theme-muted cursor-pointer select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {label} {active && (dir === 'desc' ? '↓' : '↑')}
    </th>
  )
}

export function ScorecardTable({ entries, sortKey, sortDir, onSort }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!entries.length) {
    return <p className="text-sm text-theme-muted text-center py-16">No stocks match the current filters</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-theme-bg-alt border-b border-theme-border sticky top-0">
          <tr>
            <th className="px-3 py-2.5 w-8" />
            <SortHeader label="#" active={sortKey === 'rank'} dir={sortDir} onClick={() => onSort('rank')} align="left" />
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Ticker</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Sector</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Universe</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Run Date</th>
            <SortHeader label="CMP" active={sortKey === 'cmp'} dir={sortDir} onClick={() => onSort('cmp')} />
            <SortHeader label="Score" active={sortKey === 'score'} dir={sortDir} onClick={() => onSort('score')} />
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-theme-muted">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const isExp = expanded === e.id
            return (
              <React.Fragment key={e.id}>
                <tr
                  onClick={() => setExpanded(isExp ? null : e.id)}
                  className={`border-b border-theme-border cursor-pointer transition-colors ${isExp ? 'bg-indigo-50' : 'hover:bg-theme-bg-alt/60'}`}
                >
                  <td className="px-3 py-2.5 text-theme-muted">{isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</td>
                  <td className="px-3 py-2.5 text-theme-muted tabular-nums">{e.rank}</td>
                  <td className="px-3 py-2.5 font-semibold text-theme-text">
                    <span className="inline-flex items-center gap-1">
                      {e.ticker}
                      {e.modelScores.length > 0 && <Sparkles size={11} className="text-indigo-500" aria-label="AI-generated" />}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-theme-muted text-xs">{e.sector}</td>
                  <td className="px-3 py-2.5 text-theme-muted text-xs whitespace-nowrap">{universeLabel(e.universe)}</td>
                  <td className="px-3 py-2.5 text-theme-muted text-xs whitespace-nowrap">{e.runDate}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">₹{e.cmp.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-theme-text">{e.score.toFixed(1)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${recommendationBadgeCls(e.recommendation)}`}>
                      {e.recommendation}
                    </span>
                  </td>
                </tr>
                {isExp && (
                  <tr>
                    <td colSpan={9} className="px-0 py-0">
                      <FactorDetailCards entry={e} />
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
