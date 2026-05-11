import { IncomeCategory, RecurringFrequency } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export interface IncomeInput {
  source: string
  amountPaise: number
  category: IncomeCategory
  date: string
  recurring?: boolean
  frequency?: RecurringFrequency
  notes?: string | null
}

export async function list(
  userId: string,
  month?: string,
  category?: IncomeCategory,
) {
  return prisma.incomeRecord.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(month ? { date: { startsWith: month } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { date: 'desc' },
    take: 200,
  })
}

export async function create(userId: string, data: IncomeInput) {
  return prisma.incomeRecord.create({
    data: { userId, ...data },
  })
}

export async function update(userId: string, id: string, data: Partial<IncomeInput>) {
  const record = await prisma.incomeRecord.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!record) throw new AppError(404, 'Income record not found')

  return prisma.incomeRecord.update({ where: { id }, data })
}

export async function remove(userId: string, id: string) {
  const record = await prisma.incomeRecord.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!record) throw new AppError(404, 'Income record not found')

  await prisma.incomeRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function summary(userId: string, month?: string) {
  const records = await prisma.incomeRecord.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(month ? { date: { startsWith: month } } : {}),
    },
    select: { category: true, amountPaise: true },
  })

  const byCategoryMap: Partial<Record<IncomeCategory, number>> = {}
  let monthlyTotal = 0
  for (const r of records) {
    byCategoryMap[r.category] = (byCategoryMap[r.category] ?? 0) + r.amountPaise
    monthlyTotal += r.amountPaise
  }

  const byCategory = (Object.entries(byCategoryMap) as [IncomeCategory, number][]).map(
    ([category, totalPaise]) => ({ category, totalPaise }),
  )

  const year = month ? month.slice(0, 4) : new Date().getFullYear().toString()
  const ytdRecords = await prisma.incomeRecord.findMany({
    where: {
      userId,
      deletedAt: null,
      date: { gte: `${year}-01-01` },
    },
    select: { amountPaise: true },
  })
  const ytdTotal = ytdRecords.reduce((sum, r) => sum + r.amountPaise, 0)

  return { byCategory, monthlyTotal, ytdTotal }
}
