import { Layers } from 'lucide-react'
import { BrokerCard } from '../components/broker/BrokerCard'
import { useBrokerConnectionsQuery, useDisconnectBrokerMutation } from '../hooks/useBrokerConnections'
import { BROKER_META } from '../types/broker'
import type { BrokerSlug, BrokerConnection } from '../types/broker'

const DEFAULT_CONNECTION = (broker: BrokerSlug, connectionType: 'API' | 'CSV'): BrokerConnection => ({
  id: '',
  broker,
  connectionType,
  status: 'DISCONNECTED',
  lastSyncedAt: null,
  errorMessage: null,
  syncSummary: null,
})

export default function BrokerHubPage() {
  const { data, isLoading, isError } = useBrokerConnectionsQuery()
  const disconnect = useDisconnectBrokerMutation()

  const connectionMap = new Map(data?.map((c) => [c.broker, c]) ?? [])

  const handleDisconnect = (broker: BrokerSlug) => {
    if (!window.confirm(`Disconnect ${broker.replace('_', ' ')}? This will clear stored credentials.`)) return
    disconnect.mutate(broker)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BROKER_META.map((m) => (
            <div key={m.slug} className="h-48 rounded-xl bg-theme-bg-alt animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Failed to load broker connections. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-theme-primary/10 flex items-center justify-center">
          <Layers size={20} className="text-theme-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-theme-text">Broker Hub</h1>
          <p className="text-sm text-theme-muted">Manage your broker connections and sync trades</p>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="flex gap-4 text-sm">
          <span className="text-theme-muted">
            <span className="font-semibold text-green-600">
              {data.filter((c) => c.status === 'CONNECTED').length}
            </span>{' '}
            connected
          </span>
          <span className="text-theme-muted">
            <span className="font-semibold text-theme-text">
              {data.reduce((s, c) => s + (c.syncSummary?.tradesSynced ?? 0), 0)}
            </span>{' '}
            trades synced
          </span>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BROKER_META.map((meta) => {
          const conn = connectionMap.get(meta.slug) ?? DEFAULT_CONNECTION(meta.slug, meta.connectionType)
          return (
            <BrokerCard
              key={meta.slug}
              meta={meta}
              connection={conn}
              onDisconnect={handleDisconnect}
              isDisconnecting={disconnect.isPending && disconnect.variables === meta.slug}
            />
          )
        })}
      </div>
    </div>
  )
}
