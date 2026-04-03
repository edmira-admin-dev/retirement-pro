import { AssetClass } from '@prisma/client'
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

export async function list(userId: string) {
  return prisma.holding.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function create(userId: string, data: HoldingInput) {
  return prisma.holding.create({
    data: { ...data, userId },
  })
}

export async function update(userId: string, id: string, data: Partial<HoldingInput>) {
  const holding = await prisma.holding.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!holding) throw new AppError(404, 'Holding not found')

  return prisma.holding.update({
    where: { id },
    data: { ...data, lastUpdated: new Date() },
  })
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
