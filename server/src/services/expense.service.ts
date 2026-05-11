import { prisma } from '../config/prisma'
import { ExpenseType, ExpenseCategory } from '@prisma/client'

export const CATEGORY_TYPE_MAP: Record<ExpenseCategory, ExpenseType> = {
  RENT: 'FIXED', ELECTRICITY: 'FIXED', WATER: 'FIXED', GAS: 'FIXED',
  INTERNET: 'FIXED', GROCERY: 'FIXED', COOK: 'FIXED', DRIVER: 'FIXED',
  MAID: 'FIXED', INSURANCE: 'FIXED', SUBSCRIPTIONS: 'FIXED', FIXED_OTHER: 'FIXED',
  FOOD: 'DISCRETIONARY', TRANSPORT: 'DISCRETIONARY', HEALTHCARE: 'DISCRETIONARY',
  ENTERTAINMENT: 'DISCRETIONARY', SHOPPING: 'DISCRETIONARY', EDUCATION: 'DISCRETIONARY',
  TRAVEL: 'DISCRETIONARY', INVESTMENT: 'DISCRETIONARY', DISC_OTHER: 'DISCRETIONARY',
  HOME_LOAN_EMI: 'LOAN', CAR_LOAN_EMI: 'LOAN', PERSONAL_LOAN_EMI: 'LOAN',
  EDUCATION_LOAN_EMI: 'LOAN', CREDIT_CARD_EMI: 'LOAN', LOAN_OTHER: 'LOAN',
}

export interface ExpenseInput {
  merchant: string
  amountPaise: number
  expenseType: ExpenseType
  category: ExpenseCategory
  date: string
  recurring?: boolean
  notes?: string | null
  importedFrom?: 'MANUAL' | 'CSV' | null
}

interface ListParams {
  month?: string
  type?: ExpenseType
  category?: ExpenseCategory
  q?: string
}

export async function list(userId: string, params: ListParams) {
  const { month, type, category, q } = params
  return prisma.expenseRecord.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(month ? { date: { startsWith: month } } : {}),
      ...(type ? { expenseType: type } : {}),
      ...(category ? { category } : {}),
      ...(q ? { merchant: { contains: q } } : {}),
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 500,
  })
}

export async function create(userId: string, inputs: ExpenseInput | ExpenseInput[]) {
  const records = Array.isArray(inputs) ? inputs : [inputs]

  const duplicates: string[] = []
  for (const r of records) {
    const existing = await prisma.expenseRecord.findFirst({
      where: { userId, date: r.date, amountPaise: r.amountPaise, merchant: r.merchant, deletedAt: null },
      select: { id: true },
    })
    if (existing) duplicates.push(existing.id)
  }
  if (duplicates.length > 0) {
    const err = new Error(`Duplicate expense records`) as Error & { status: number; conflictIds: string[] }
    err.status = 409
    err.conflictIds = duplicates
    throw err
  }

  const created = await prisma.$transaction(
    records.map(r =>
      prisma.expenseRecord.create({
        data: {
          userId,
          merchant: r.merchant,
          amountPaise: r.amountPaise,
          expenseType: r.expenseType,
          category: r.category,
          date: r.date,
          recurring: r.recurring ?? false,
          notes: r.notes ?? null,
          importedFrom: r.importedFrom ?? 'MANUAL',
        },
      })
    )
  )
  return Array.isArray(inputs) ? created : created[0]
}

export async function update(userId: string, id: string, data: Partial<ExpenseInput>) {
  const record = await prisma.expenseRecord.findFirst({ where: { id, userId, deletedAt: null } })
  if (!record) {
    const err = new Error('Expense not found') as Error & { status: number }
    err.status = 404
    throw err
  }
  return prisma.expenseRecord.update({ where: { id }, data })
}

export async function remove(userId: string, id: string) {
  const record = await prisma.expenseRecord.findFirst({ where: { id, userId, deletedAt: null } })
  if (!record) {
    const err = new Error('Expense not found') as Error & { status: number }
    err.status = 404
    throw err
  }
  return prisma.expenseRecord.update({ where: { id }, data: { deletedAt: new Date() } })
}

export async function summary(userId: string, month?: string) {
  const grouped = await prisma.expenseRecord.groupBy({
    by: ['expenseType', 'category'],
    where: {
      userId,
      deletedAt: null,
      ...(month ? { date: { startsWith: month } } : {}),
    },
    _sum: { amountPaise: true },
  })

  const byType: Record<string, number> = { FIXED: 0, DISCRETIONARY: 0, LOAN: 0 }
  const byCategory: Record<string, number> = {}

  for (const row of grouped) {
    const amt = row._sum.amountPaise ?? 0
    byType[row.expenseType] = (byType[row.expenseType] ?? 0) + amt
    byCategory[row.category] = (byCategory[row.category] ?? 0) + amt
  }

  return { byType, byCategory, total: byType.FIXED + byType.DISCRETIONARY + byType.LOAN }
}
