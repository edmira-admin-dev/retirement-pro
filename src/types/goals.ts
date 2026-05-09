export type GoalCategory = 'FIRE' | 'EDUCATION' | 'WEDDING' | 'PARENTS' | 'HOUSING' | 'OTHER'

export interface Goal {
  id: string
  name: string
  category: GoalCategory
  targetAmount: number      // ₹
  targetYear: number
  currentAllocation: number // ₹
  inflationRate: number     // % pa
  notes?: string
}

export type GoalInput = Omit<Goal, 'id'>
