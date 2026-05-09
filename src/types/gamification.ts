export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  category: 'portfolio' | 'goals' | 'health' | 'consistency'
}

export interface GamificationData {
  badges: Badge[]
  streakDays: number
  lastVisitDate: string
  dismissedNudges: string[]
}

export interface GamificationPatch {
  badges?: Badge[]
  streakDays?: number
  lastVisitDate?: string
  dismissedNudges?: string[]
}
