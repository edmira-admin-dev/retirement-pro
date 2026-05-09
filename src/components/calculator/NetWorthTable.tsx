import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatRupeesCompact } from '../../utils/money'
import type { SimulationYear } from '../../types/fire'

interface Props {
  years: SimulationYear[]
  retirementAge: number
}

export const NetWorthTable = ({ years, retirementAge }: Props) => {
  const [showAll, setShowAll] = useState(false)

  const display = showAll ? years : years.filter((y) => y.age % 5 === 0)

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-theme-text">Net Worth Timeline</h2>
          <p className="text-xs text-theme-muted mt-0.5">Year-by-year portfolio projection</p>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1 text-xs text-theme-muted hover:text-theme-text transition-colors shrink-0"
        >
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAll ? 'Every 5 yrs' : 'All years'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-theme-border">
              {['Age', 'Year', 'Portfolio', 'Phase', 'Annual Flow'].map((h) => (
                <th key={h} className="text-left text-theme-muted font-medium pb-2 pr-4 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((y) => {
              const isRetired = y.age >= retirementAge
              const flow = isRetired ? -y.withdrawalAmount : y.investableSurplus
              const flowPos = flow >= 0
              return (
                <tr
                  key={y.age}
                  className={`border-b border-theme-border/50 ${
                    y.age === retirementAge ? 'bg-theme-primary/5' : ''
                  }`}
                >
                  <td className="py-1.5 pr-4 font-mono text-theme-text">{y.age}</td>
                  <td className="py-1.5 pr-4 text-theme-muted">{y.year}</td>
                  <td className="py-1.5 pr-4 font-mono text-theme-text">
                    {y.portfolioValue > 0 ? formatRupeesCompact(y.portfolioValue) : '—'}
                  </td>
                  <td className="py-1.5 pr-4">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        isRetired
                          ? 'bg-warning/15 text-warning'
                          : 'bg-theme-primary/15 text-theme-primary'
                      }`}
                    >
                      {isRetired ? 'Retire' : 'Accum'}
                    </span>
                  </td>
                  <td className={`py-1.5 font-mono ${flowPos ? 'text-success' : 'text-danger'}`}>
                    {flowPos ? '+' : '-'}{formatRupeesCompact(Math.abs(flow))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
