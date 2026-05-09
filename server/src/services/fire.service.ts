import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

export interface FireProfileInput {
  currentAge: number
  retirementAge?: number
  lifeExpectancy?: number
  currentMonthlyExpense: number // paise
  medicalMonthlyExpense: number // paise
  lifestyleBuffer?: number
  expectedReturnPre?: number
  expectedReturnPost?: number
  // Extended
  generalInflation?: number
  medicalInflation?: number
  withdrawalRate?: number
  expenseCategories?: Prisma.InputJsonValue
  incomeInputs?: Prisma.InputJsonValue
  assetAllocation?: Prisma.InputJsonValue
  liabilities?: Prisma.InputJsonValue
  npsInputs?: Prisma.InputJsonValue
}

export async function get(userId: string) {
  return prisma.fireProfile.findUnique({ where: { userId } })
}

export async function upsert(userId: string, data: FireProfileInput) {
  return prisma.fireProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  })
}
