import type { ScorecardEntry } from '../../hooks/useFactorScorecard'
import { FACTOR_LABELS, scoreTierCls, stripScorePrefix, providerLabel } from './factorLabels'

interface Props {
  entry: ScorecardEntry
}

export function FactorDetailCards({ entry }: Props) {
  return (
    <div className="border-t-2 border-indigo-100 bg-indigo-50/30 px-3 py-2.5 space-y-2">
      {entry.modelScores.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <span className="text-theme-muted">Scored by</span>
          {entry.modelScores.map((m) => (
            <span key={m.id} className="px-1.5 py-0.5 rounded-full bg-white border border-theme-border text-theme-text font-medium">
              {providerLabel(m.provider)} {m.score.toFixed(1)}
            </span>
          ))}
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">Avg {entry.score.toFixed(1)}</span>
        </div>
      )}

      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FACTOR_LABELS.map((f) => {
          const score = entry[f.field]
          const text = stripScorePrefix(entry.reasoning[f.key])
          return (
            <div key={f.key} className="bg-theme-card border border-theme-border rounded-lg px-2 py-1.5">
              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                <span className="text-[11px] font-semibold text-theme-text">{f.label}</span>
                <span className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${scoreTierCls(score)}`}>
                  {Math.round(score)}
                </span>
              </div>
              <p className="text-[11px] text-theme-muted leading-snug line-clamp-2">{text || 'No commentary available'}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
