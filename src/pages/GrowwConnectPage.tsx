import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Link2,
  ShieldAlert,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import {
  useGrowwStatus,
  useGrowwConnect,
  useGrowwRefreshToken,
  useGrowwSync
} from '../hooks/useGrowwConnect'

function formatRelative (iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function GrowwConnectPage () {
  const navigate = useNavigate()
  const [syncResult, setSyncResult] = useState<{ trades: number; holdings: number; errors: string[] } | null>(null)

  const { data: status, isLoading: statusLoading } = useGrowwStatus()
  const connectMutation = useGrowwConnect()
  const refreshMutation = useGrowwRefreshToken()
  const syncMutation = useGrowwSync()

  const handleConnect = () => {
    connectMutation.mutate()
  }

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        setSyncResult({ trades: result.trades.synced, holdings: result.holdings.synced, errors: result.errors })
      }
    })
  }

  const isConnected = status?.connected
  const tokenExpired = status?.tokenExpired

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/trading/brokers')}
          className="p-2 rounded-lg hover:bg-theme-bg-alt transition-colors text-theme-muted"
          aria-label="Back to Broker Hub"
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ backgroundColor: '#00d09c' }}
        >
          G
        </div>
        <div>
          <h1 className="text-lg font-bold text-theme-text">Groww</h1>
          <p className="text-sm text-theme-muted">Groww Trading API</p>
        </div>
      </div>

      {/* Env key info */}
      <div className="bg-theme-bg-alt rounded-xl px-4 py-3 flex items-start gap-2.5">
        <ShieldAlert size={15} className="text-theme-muted shrink-0 mt-0.5" />
        <p className="text-xs text-theme-muted">
          API key is read from the server environment variable{' '}
          <code className="font-mono bg-black/5 px-1 py-0.5 rounded text-[11px]">GROWW_API_KEY</code>.
          No credentials are entered in the app.
        </p>
      </div>

      {/* Token expired warning */}
      {isConnected && tokenExpired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800 text-sm">Token expired</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Groww tokens reset at 6:00 AM daily. First approve your API key at groww.in, then refresh.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://groww.in/cloud/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 font-medium underline flex items-center gap-1 hover:text-amber-900"
              >
                Approve on Groww <ExternalLink size={11} />
              </a>
              <button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="text-xs text-amber-800 font-semibold flex items-center gap-1 hover:text-amber-900 disabled:opacity-60"
              >
                {refreshMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                Refresh Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status card */}
      {statusLoading ? (
        <div className="h-40 rounded-xl bg-theme-bg-alt animate-pulse" />
      ) : (
        <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-theme-text">Status</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Disconnected
              </span>
            )}
          </div>

          {isConnected && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-muted">Last synced</span>
                <span className="font-medium text-theme-text">{formatRelative(status.lastSyncedAt)}</span>
              </div>
              {status.syncSummary && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-theme-bg-alt rounded-lg px-3 py-2.5 text-center">
                    <p className="text-lg font-bold text-theme-text">{status.syncSummary.tradesSynced}</p>
                    <p className="text-xs text-theme-muted">Trades synced</p>
                  </div>
                  <div className="bg-theme-bg-alt rounded-lg px-3 py-2.5 text-center">
                    <p className="text-lg font-bold text-theme-text">{status.syncSummary.duplicatesSkipped}</p>
                    <p className="text-xs text-theme-muted">Duplicates skipped</p>
                  </div>
                </div>
              )}
              {status.errorMessage && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{status.errorMessage}</p>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isConnected ? (
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending || !!tokenExpired}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d09c] text-white text-sm font-medium hover:bg-[#00b589] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {syncMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d09c] text-white text-sm font-medium hover:bg-[#00b589] transition-colors disabled:opacity-60"
              >
                {connectMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                {connectMutation.isPending ? 'Connecting…' : 'Connect Groww'}
              </button>
            )}
          </div>

          {connectMutation.isError && (
            <p className="text-xs text-red-600">{connectMutation.error?.message}</p>
          )}
        </div>
      )}

      {/* Sync success */}
      {syncResult && !syncMutation.isPending && (
        <div className={`border rounded-xl p-4 flex items-start gap-3 ${syncResult.errors.length ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          {syncResult.errors.length ? (
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className={`font-medium text-sm ${syncResult.errors.length ? 'text-amber-800' : 'text-green-800'}`}>
              Sync complete
            </p>
            <p className={`text-xs ${syncResult.errors.length ? 'text-amber-700' : 'text-green-700'}`}>
              {syncResult.trades} trades · {syncResult.holdings} new holdings imported
            </p>
            {syncResult.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-600 font-mono bg-red-50 rounded px-2 py-1 mt-1">{e}</p>
            ))}
          </div>
        </div>
      )}

      {syncMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{syncMutation.error?.message}</p>
        </div>
      )}

      {/* Setup guide */}
      {!isConnected && (
        <div className="bg-theme-bg-alt rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-theme-text uppercase tracking-wide">Setup guide</p>
          <ol className="space-y-2 text-xs text-theme-muted list-none">
            {[
              { text: 'Subscribe to Groww Trading API (₹499 + tax/month)', link: { url: 'https://groww.in/trade-api', label: 'groww.in/trade-api' } },
              { text: 'Go to Profile → Settings → Trading APIs → Generate API key', link: null },
              { text: 'Copy the API key (shown only once)', link: null },
              { text: 'Set GROWW_API_KEY=<your-key> in the server .env file and restart', link: null },
              { text: 'Approve the key daily at groww.in/cloud/api-keys, then click Connect', link: { url: 'https://groww.in/cloud/api-keys', label: 'Approve here' } },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#00d09c' }}
                >
                  {i + 1}
                </span>
                <span>
                  {step.text}
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[#00a07a] underline inline-flex items-center gap-0.5"
                    >
                      {step.link.label} <ExternalLink size={10} />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-theme-muted bg-white/60 rounded-lg px-3 py-2">
            Tokens expire at 6:00 AM daily — re-approve on Groww portal and hit "Refresh Token" each morning.
          </p>
        </div>
      )}
    </div>
  )
}
