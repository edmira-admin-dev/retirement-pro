import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useScorecardRun } from '../../hooks/useFactorScorecard'

interface Props {
  runId: string
  onDismiss: () => void
}

export function RunStatusBanner({ runId, onDismiss }: Props) {
  const { data: run } = useScorecardRun(runId)
  if (!run) return null

  if (run.status === 'DONE') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 size={16} />
        AI scorecard run complete — {run.batchesTotal} batches scored across Gemini, GPT-4o and Claude.
        <button onClick={onDismiss} className="ml-auto text-xs font-semibold underline cursor-pointer">Dismiss</button>
      </div>
    )
  }

  if (run.status === 'FAILED') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <XCircle size={16} />
        Run failed: {run.error ?? 'Unknown error'}
        <button onClick={onDismiss} className="ml-auto text-xs font-semibold underline cursor-pointer">Dismiss</button>
      </div>
    )
  }

  const pct = run.batchesTotal ? Math.round((run.batchesDone / run.batchesTotal) * 100) : 0
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 text-sm text-indigo-700">
        <Loader2 size={16} className="animate-spin" />
        Scoring batch {run.batchesDone} of {run.batchesTotal || '…'} with Gemini, GPT-4o and Claude…
      </div>
      <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
