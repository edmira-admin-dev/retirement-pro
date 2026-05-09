import { create } from 'zustand'
import type { Goal } from '../types/goals'

interface GoalsUIStore {
  modalOpen: boolean
  editingGoal: Goal | null
  openAdd: () => void
  openEdit: (goal: Goal) => void
  closeModal: () => void
}

export const useGoalsUIStore = create<GoalsUIStore>((set) => ({
  modalOpen: false,
  editingGoal: null,
  openAdd: () => set({ modalOpen: true, editingGoal: null }),
  openEdit: (goal) => set({ modalOpen: true, editingGoal: goal }),
  closeModal: () => set({ modalOpen: false, editingGoal: null }),
}))
