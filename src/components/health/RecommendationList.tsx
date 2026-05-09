import { Lightbulb } from 'lucide-react'

interface RecommendationListProps {
  recommendations: string[]
}

export const RecommendationList = ({ recommendations }: RecommendationListProps) => {
  if (recommendations.length === 0) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-xl p-5 flex items-center gap-3">
        <Lightbulb size={18} className="text-success shrink-0" />
        <p className="text-sm text-success font-medium">
          All ratios are healthy — keep up the great work!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={15} className="text-warning shrink-0" />
        <p className="text-xs text-theme-muted uppercase tracking-wider">Action Plan</p>
      </div>
      <ol className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-theme-text leading-relaxed">{rec}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
