import { prisma } from '../config/prisma'

function todayString(): string {
  return new Date().toISOString().split('T')[0]!
}

export async function upsertSnapshot(userId: string): Promise<void> {
  const holdings = await prisma.holding.findMany({
    where: { userId, deletedAt: null },
    select: { currentValue: true },
  })
  const total = holdings.reduce((sum, h) => sum + Number(h.currentValue), 0)
  const snapshotDate = todayString()

  await prisma.netWorthSnapshot.upsert({
    where: { userId_snapshotDate: { userId, snapshotDate } },
    create: { userId, snapshotDate, valueInPaise: BigInt(total) },
    update: { valueInPaise: BigInt(total) },
  })
}

export async function listSnapshots(userId: string) {
  const rows = await prisma.netWorthSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotDate: 'asc' },
    select: { snapshotDate: true, valueInPaise: true },
  })
  return rows.map((r) => ({
    date: r.snapshotDate,
    value: Number(r.valueInPaise),
  }))
}
