import { prisma } from '../config/prisma'

export interface TaxProfileInput {
  realizedGainsFY?: number // paise
  unrealizedEquityGains?: number // paise
}

export async function get(userId: string) {
  return prisma.taxProfile.findUnique({ where: { userId } })
}

export async function upsert(userId: string, data: TaxProfileInput) {
  return prisma.taxProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  })
}
