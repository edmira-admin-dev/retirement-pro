import { useRef, useState } from 'react'
import { Upload, Loader2, X, FileSpreadsheet } from 'lucide-react'
import { useUploadScorecard, useDeleteScorecardUpload, type ScorecardUpload } from '../../hooks/useFactorScorecard'
import { universeLabel } from './factorLabels'

interface Props {
  uploads: ScorecardUpload[]
}

export function ScorecardUploadZone({ uploads }: Props) {
  const [runDate, setRunDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadScorecard()
  const deleteMutation = useDeleteScorecardUpload()

  function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    uploadMutation.mutate(
      { file, runDate },
      { onError: (e) => setError(e instanceof Error ? e.message : 'Upload failed') },
    )
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="block text-xs font-medium text-theme-muted mb-1">Scorecard run date</label>
          <input
            type="date"
            value={runDate}
            onChange={(e) => setRunDate(e.target.value)}
            className="text-sm border border-theme-border rounded-lg px-2.5 py-2 bg-white text-theme-text"
          />
        </div>

        <label
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors mt-5
            ${uploadMutation.isPending ? 'bg-theme-bg-alt text-theme-muted' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {uploadMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Upload scorecard .xlsx
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            disabled={uploadMutation.isPending}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        <p className="text-xs text-theme-muted mt-5">Accepts Nifty 100 or Nifty Midcap 150 factor scorecard exports</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {uploads.map((u) => (
            <span key={u.id} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-theme-bg-alt border border-theme-border text-xs text-theme-text">
              <FileSpreadsheet size={12} className="text-theme-muted" />
              {universeLabel(u.universe)} · {u.runDate}
              <button
                onClick={() => deleteMutation.mutate(u.id)}
                disabled={deleteMutation.isPending}
                aria-label={`Remove ${universeLabel(u.universe)} ${u.runDate} upload`}
                className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 text-theme-muted transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
