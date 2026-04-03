import { GoalCategory } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface GoalInput {
  name: string
  category: GoalCategory
  targetAmount: number // paise
  targetYear: number
  currentAllocation: number // paise
  inflationRate?: number
  notes?: string
}

export async function list(userId: string) {
  return prisma.goal.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })
}

export async function create(userId: string, data: GoalInput) {
  return prisma.goal.create({
    data: { userId, ...data },
  })
}

export async function update(userId: string, id: string, data: Partial<GoalInput>) {
  const goal = await prisma.goal.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!goal) throw new AppError(404, 'Goal not found')

  return prisma.goal.update({ where: { id }, data })
}

export async function remove(userId: string, id: string) {
  const goal = await prisma.goal.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!goal) throw new AppError(404, 'Goal not found')

  await prisma.goal.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
