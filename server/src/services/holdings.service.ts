import { AssetClass, Holding } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface HoldingInput {
  name: string
  assetClass: AssetClass
  currentValue: number // paise
  investedValue: number // paise
  units?: number
  nav?: number
  notes?: string
}

// BigInt fields come back as bigint from Prisma — convert to number for JSON serialization.
// Number() is safe here: values are paise amounts that fit well within Number.MAX_SAFE_INTEGER.
function toSerialized(h: Holding) {
  return {
    ...h,
    currentValue: Number(h.currentValue),
    investedValue: Number(h.investedValue),
  }
}

export async function list(userId: string) {
  const holdings = await prisma.holding.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return holdings.map(toSerialized)
}

export async function create(userId: string, data: HoldingInput) {
  const { currentValue, investedValue, ...rest } = data
  const holding = await prisma.holding.create({
    data: {
      ...rest,
      userId,
      currentValue: BigInt(currentValue),
      investedValue: BigInt(investedValue),
    },
  })
  return toSerialized(holding)
}

export async function update(userId: string, id: string, data: Partial<HoldingInput>) {
  const holding = await prisma.holding.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!holding) throw new AppError(404, 'Holding not found')

  const { currentValue, investedValue, ...rest } = data
  const updated = await prisma.holding.update({
    where: { id },
    data: {
      ...rest,
      lastUpdated: new Date(),
      ...(currentValue !== undefined && { currentValue: BigInt(currentValue) }),
      ...(investedValue !== undefined && { investedValue: BigInt(investedValue) }),
    },
  })
  return toSerialized(updated)
}

export async function remove(userId: string, id: string) {
  const holding = await prisma.holding.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!holding) throw new AppError(404, 'Holding not found')

  await prisma.holding.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
