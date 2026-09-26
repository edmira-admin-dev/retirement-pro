import { useRef, useState } from 'react'
import { FileText, Upload, AlertCircle } from 'lucide-react'

interface UploadAnalysisPanelProps {
  ticker: string
  onUpload: (fileName: string, content: string) => void
}

export function UploadAnalysisPanel ({ ticker, onUpload }: UploadAnalysisPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile (file: File) {
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Please upload a .md (Markdown) file.')
      return
    }
    setError(null)
    const text = await file.text()
    onUpload(file.name, text)
  }

  return (
    <div className="max-w-lg mx-auto text-center space-y-4 pt-16 p-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
        <FileText size={24} className="text-indigo-600" />
      </div>
      <p className="font-semibold text-theme-text">No analysis uploaded for {ticker}</p>
      <p className="text-sm text-theme-muted">
        Upload the latest institutional research note (.md) for {ticker} to build its dashboard — CMP, recommendation, factor score, and full analysis.
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        <Upload size={14} /> Upload Analysis (.md)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".md"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error && (
        <p className="flex items-center justify-center gap-1.5 text-sm text-red-600">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  )
}
