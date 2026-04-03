import { prisma } from '../config/prisma'

export interface HealthProfileInput {
  monthlyIncome: number // paise
  monthlyExpenses: number
  monthlyEMIs: number
  liquidAssets: number
  totalLiabilities: number
  monthlySavings: number
  hasTermInsurance?: boolean
  hasHealthInsurance?: boolean
  hasWill?: boolean
  hasNominations?: boolean
}

export async function get(userId: string) {
  return prisma.healthProfile.findUnique({ where: { userId } })
}

export async function upsert(userId: string, data: HealthProfileInput) {
  return prisma.healthProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  })
}
