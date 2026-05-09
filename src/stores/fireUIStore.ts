import { create } from 'zustand'

export type InputTab = 'profile' | 'expenses' | 'income' | 'portfolio' | 'liabilities' | 'assumptions'

interface FireUIState {
  inflationExpanded: boolean
  toggleInflation: () => void
  activeTab: InputTab
  setActiveTab: (tab: InputTab) => void
}

export const useFireUIStore = create<FireUIState>((set) => ({
  inflationExpanded: false,
  toggleInflation: () => set((s) => ({ inflationExpanded: !s.inflationExpanded })),
  activeTab: 'profile',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
