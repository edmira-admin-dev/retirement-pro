import { useNavigate } from 'react-router-dom'
import { RefreshCw, Unplug, Link2 } from 'lucide-react'
import { BrokerStatusBadge } from './BrokerStatusBadge'
import type { BrokerConnection, BrokerMeta } from '../../types/broker'

interface Props {
  meta: BrokerMeta
  connection: BrokerConnection
  onDisconnect: (broker: BrokerConnection['broker']) => void
  isDisconnecting: boolean
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function BrokerCard({ meta, connection, onDisconnect, isDisconnecting }: Props) {
  const navigate = useNavigate()
  const isConnected    = connection.status === 'CONNECTED'
  const isDisconnected = connection.status === 'DISCONNECTED'

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: logo + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: meta.color }}
            aria-hidden="true"
          >
            {meta.initial}
          </div>
          <div>
            <h3 className="font-semibold text-theme-text text-sm leading-tight">{meta.name}</h3>
            <span className="text-xs text-theme-muted mt-0.5 inline-block">
              via {meta.connectionType === 'API' ? 'API' : 'CSV Import'}
            </span>
          </div>
        </div>
        <BrokerStatusBadge status={connection.status} />
      </div>

      {/* Sync info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-theme-muted">
          <span>Last synced</span>
          <span className="font-medium text-theme-text-sec">
            {formatRelative(connection.lastSyncedAt)}
          </span>
        </div>
        {connection.syncSummary && (
          <div className="flex items-center justify-between text-xs text-theme-muted">
            <span>Trades synced</span>
            <span className="font-medium text-theme-text-sec">
              {connection.syncSummary.tradesSynced}
              {connection.syncSummary.duplicatesSkipped > 0 && (
                <span className="text-amber-500 ml-1">
                  ({connection.syncSummary.duplicatesSkipped} skipped)
                </span>
              )}
            </span>
          </div>
        )}
        {connection.errorMessage && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5 mt-1">
            {connection.errorMessage}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {isDisconnected ? (
          <button
            onClick={() => navigate(meta.connectPath)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-theme-primary text-white text-sm font-medium hover:bg-theme-primary-dark transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          >
            <Link2 size={14} />
            Connect
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate(meta.connectPath)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-theme-bg-alt text-theme-text text-sm font-medium hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              <RefreshCw size={14} />
              {isConnected ? 'Sync' : 'Reconnect'}
            </button>
            <button
              onClick={() => onDisconnect(connection.broker)}
              disabled={isDisconnecting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Unplug size={14} />
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  )
}
