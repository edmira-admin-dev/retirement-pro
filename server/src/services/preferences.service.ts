import { prisma } from '../config/prisma'

export interface PreferencesInput {
  expenseViewMonth?: string | null
  incomeViewMonth?: string | null
}

export async function get(userId: string) {
  return prisma.userPreferences.findUnique({ where: { userId } })
}

export async function upsert(userId: string, data: PreferencesInput) {
  return prisma.userPreferences.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })
}
