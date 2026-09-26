import { useRef, useState } from 'react'
import { Upload, Loader2, Sparkles, FileSpreadsheet } from 'lucide-react'
import { useFundamentalsUploads, useUploadFundamentals, useStartScorecardRun } from '../../hooks/useFactorScorecard'
import { universeLabel } from './factorLabels'

interface Props {
  onRunStarted: (runId: string) => void
  disabled: boolean
}

export function FundamentalsUploadZone({ onRunStarted, disabled }: Props) {
  const [runDate, setRunDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: uploads } = useFundamentalsUploads()
  const uploadMutation = useUploadFundamentals()
  const runMutation = useStartScorecardRun()

  function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    uploadMutation.mutate(
      { file, runDate },
      { onError: (e) => setError(e instanceof Error ? e.message : 'Upload failed') },
    )
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleRun(fundamentalsUploadId: string) {
    setError(null)
    runMutation.mutate(fundamentalsUploadId, {
      onSuccess: (run) => onRunStarted(run.id),
      onError: (e) => setError(e instanceof Error ? e.message : 'Failed to start run'),
    })
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-indigo-600" />
        <h2 className="text-sm font-semibold text-theme-text">Run with AI — Gemini + GPT-4o + Claude</h2>
      </div>
      <p className="text-xs text-theme-muted">
        Upload per-ticker fundamentals (Ticker, Sector, CMP, PE, ROE, growth, etc.) and each of the 3 models scores every factor in batches; results are averaged into the scorecard below.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-xs font-medium text-theme-muted mb-1">Run date</label>
          <input
            type="date"
            value={runDate}
            onChange={(e) => setRunDate(e.target.value)}
            className="text-sm border border-theme-border rounded-lg px-2.5 py-2 bg-white text-theme-text"
          />
        </div>

        <label
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors mt-5
            ${uploadMutation.isPending || disabled ? 'bg-theme-bg-alt text-theme-muted' : 'bg-theme-bg-alt border border-theme-border text-theme-text hover:bg-theme-border/40'}`}
        >
          {uploadMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Upload fundamentals .xlsx/.csv
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            disabled={uploadMutation.isPending || disabled}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!!uploads?.length && (
        <div className="flex flex-wrap gap-2 pt-1">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-theme-bg-alt border border-theme-border text-xs text-theme-text">
              <FileSpreadsheet size={12} className="text-theme-muted" />
              {universeLabel(u.universe)} · {u.runDate} · {u.rowCount} stocks
              <button
                onClick={() => handleRun(u.id)}
                disabled={disabled || runMutation.isPending}
                className="ml-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Run AI Scorecard
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
