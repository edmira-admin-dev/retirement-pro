export type BrokerSlug = 'KITE' | 'GROWW' | 'ANGELONE' | 'HDFC_SKY'
export type ConnectionType = 'API' | 'CSV'
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

export interface BrokerConnection {
  id: string
  broker: BrokerSlug
  connectionType: ConnectionType
  status: ConnectionStatus
  lastSyncedAt: string | null
  errorMessage: string | null
  syncSummary: {
    tradesSynced: number
    duplicatesSkipped: number
  } | null
}

export interface BrokerMeta {
  slug: BrokerSlug
  name: string
  color: string
  initial: string
  connectPath: string
  connectionType: ConnectionType
}

export const BROKER_META: BrokerMeta[] = [
  {
    slug: 'KITE',
    name: 'Zerodha Kite',
    color: '#387ed1',
    initial: 'Z',
    connectPath: '/trading/kite',
    connectionType: 'API',
  },
  {
    slug: 'GROWW',
    name: 'Groww',
    color: '#00d09c',
    initial: 'G',
    connectPath: '/trading/groww',
    connectionType: 'API',
  },
  {
    slug: 'ANGELONE',
    name: 'Angel One',
    color: '#f05a28',
    initial: 'A',
    connectPath: '/trading/angelone',
    connectionType: 'API',
  },
  {
    slug: 'HDFC_SKY',
    name: 'HDFC Sky',
    color: '#004c8f',
    initial: 'H',
    connectPath: '/trading/import?broker=HDFC_SKY',
    connectionType: 'CSV',
  },
]
