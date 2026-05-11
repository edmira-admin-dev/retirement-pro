import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, RefreshCw, Link2, ArrowLeft, Loader2 } from 'lucide-react'
import { useKiteStatus, useKiteCallback, useKiteSync, useKiteLoginUrl } from '../hooks/useKiteConnect'

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function KiteConnectPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [syncResult, setSyncResult] = useState<{ trades: number; holdings: number } | null>(null)

  const { data: status, isLoading: statusLoading } = useKiteStatus()
  const { refetch: fetchLoginUrl, isFetching: urlFetching } = useKiteLoginUrl()
  const callbackMutation = useKiteCallback()
  const syncMutation = useKiteSync()

  const requestToken = searchParams.get('request_token')
  const callbackStatus = searchParams.get('status')

  // Auto-complete OAuth callback when Kite redirects back with request_token
  useEffect(() => {
    if (requestToken && callbackStatus === 'success' && !callbackMutation.isPending && !callbackMutation.isSuccess) {
      callbackMutation.mutate(requestToken, {
        onSuccess: () => {
          // Clear token from URL
          setSearchParams({}, { replace: true })
        },
      })
    }
  }, [requestToken, callbackStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    const { data: loginUrl } = await fetchLoginUrl()
    if (loginUrl) window.location.href = loginUrl
  }

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        setSyncResult({ trades: result.trades.synced, holdings: result.holdings.synced })
      },
    })
  }

  const isProcessingCallback = !!requestToken && callbackMutation.isPending

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
          style={{ backgroundColor: '#387ed1' }}
        >
          Z
        </div>
        <div>
          <h1 className="text-lg font-bold text-theme-text">Zerodha Kite</h1>
          <p className="text-sm text-theme-muted">Connect via Kite Connect API</p>
        </div>
      </div>

      {/* Processing callback */}
      {isProcessingCallback && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-3">
          <Loader2 size={20} className="text-blue-500 animate-spin shrink-0" />
          <div>
            <p className="font-medium text-blue-800 text-sm">Completing connection…</p>
            <p className="text-xs text-blue-600 mt-0.5">Exchanging session token with Zerodha</p>
          </div>
        </div>
      )}

      {/* Callback error */}
      {callbackMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 text-sm">Connection failed</p>
            <p className="text-xs text-red-600 mt-1">{callbackMutation.error?.message ?? 'Unknown error'}</p>
            <button
              onClick={handleConnect}
              className="mt-2 text-xs text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Status card */}
      {statusLoading ? (
        <div className="h-40 rounded-xl bg-theme-bg-alt animate-pulse" />
      ) : (
        <div className="bg-theme-card border border-theme-border rounded-xl p-5 space-y-4">
          {/* Connection status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-theme-text">Status</span>
            {status?.connected ? (
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

          {status?.connected && (
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
            {status?.connected ? (
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {syncMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={urlFetching}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-dark transition-colors disabled:opacity-60"
              >
                {urlFetching ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                {urlFetching ? 'Loading…' : 'Connect with Zerodha'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sync success */}
      {syncResult && !syncMutation.isPending && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 text-sm">Sync complete</p>
            <p className="text-xs text-green-700 mt-0.5">
              {syncResult.trades} trades · {syncResult.holdings} new holdings imported
            </p>
          </div>
        </div>
      )}

      {/* Sync errors */}
      {syncMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{syncMutation.error?.message}</p>
        </div>
      )}

      {/* How it works */}
      {!status?.connected && !isProcessingCallback && (
        <div className="bg-theme-bg-alt rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-theme-text uppercase tracking-wide">How it works</p>
          <ol className="space-y-2 text-xs text-theme-muted list-none">
            {[
              'Click "Connect with Zerodha" — you\'ll be redirected to Kite login',
              'Log in with your Zerodha credentials',
              'You\'ll return here automatically — connection completes instantly',
              'Click "Sync Now" to import your holdings and trades',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-theme-primary/10 text-theme-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
