import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

const ALL_BROKERS = ['KITE', 'GROWW', 'ANGELONE', 'HDFC_SKY'] as const
type BrokerSlug = (typeof ALL_BROKERS)[number]

const CONNECTION_TYPE: Record<BrokerSlug, 'API' | 'CSV'> = {
  KITE: 'API',
  GROWW: 'API',
  ANGELONE: 'API',
  HDFC_SKY: 'CSV',
}

export async function list(userId: string) {
  const rows = await prisma.brokerConnection.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      broker: true,
      connectionType: true,
      status: true,
      lastSyncedAt: true,
      errorMessage: true,
      tradesSynced: true,
      duplicatesSkipped: true,
    },
  })

  const map = new Map(rows.map((r) => [r.broker, r]))

  return ALL_BROKERS.map((broker) => {
    const row = map.get(broker)
    if (row) {
      return {
        id: row.id,
        broker,
        connectionType: row.connectionType,
        status: row.status,
        lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
        errorMessage: row.errorMessage ?? null,
        syncSummary: {
          tradesSynced: row.tradesSynced,
          duplicatesSkipped: row.duplicatesSkipped,
        },
      }
    }
    return {
      id: null,
      broker,
      connectionType: CONNECTION_TYPE[broker],
      status: 'DISCONNECTED',
      lastSyncedAt: null,
      errorMessage: null,
      syncSummary: null,
    }
  })
}

export async function disconnect(userId: string, broker: string) {
  const existing = await prisma.brokerConnection.findUnique({
    where: { userId_broker: { userId, broker } },
  })
  if (!existing || existing.deletedAt) {
    throw new AppError(404, 'Broker connection not found')
  }

  return prisma.brokerConnection.update({
    where: { userId_broker: { userId, broker } },
    data: { credentialsJson: null, status: 'DISCONNECTED', errorMessage: null },
    select: { id: true, broker: true, status: true },
  })
}
