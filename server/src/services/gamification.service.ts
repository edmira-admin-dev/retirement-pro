import { prisma } from '../config/prisma'
import { Badge } from '../types'

export interface GamificationInput {
  badges?: Badge[]
  streakDays?: number
  lastVisitDate?: string
  dismissedNudges?: string[]
}

export async function get(userId: string) {
  return prisma.gamification.findUnique({ where: { userId } })
}

export async function upsert(userId: string, data: GamificationInput) {
  const updateData: Record<string, unknown> = {}
  if (data.badges !== undefined) updateData.badges = data.badges
  if (data.streakDays !== undefined) updateData.streakDays = data.streakDays
  if (data.lastVisitDate !== undefined) updateData.lastVisitDate = data.lastVisitDate
  if (data.dismissedNudges !== undefined) updateData.dismissedNudges = data.dismissedNudges

  return prisma.gamification.upsert({
    where: { userId },
    create: {
      userId,
      badges: (data.badges ?? []) as object[],
      streakDays: data.streakDays ?? 0,
      lastVisitDate: data.lastVisitDate ?? new Date().toISOString().split('T')[0],
      dismissedNudges: (data.dismissedNudges ?? []) as string[],
    },
    update: updateData,
  })
}
