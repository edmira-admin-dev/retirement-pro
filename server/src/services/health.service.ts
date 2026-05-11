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

export async function upsertScoreHistory(userId: string, score: number) {
  const snapshotDate = new Date().toISOString().split('T')[0]
  return prisma.healthScoreHistory.upsert({
    where: { userId_snapshotDate: { userId, snapshotDate } },
    create: { userId, score, snapshotDate },
    update: { score },
  })
}

export async function getScoreHistory(userId: string) {
  return prisma.healthScoreHistory.findMany({
    where: { userId },
    orderBy: { snapshotDate: 'asc' },
  })
}
