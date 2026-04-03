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
