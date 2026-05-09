import { create } from 'zustand'

interface GamificationUIState {
  activeNudge: string | null
  setActiveNudge: (id: string | null) => void
  dismissNudge: () => void
}

export const useGamificationUIStore = create<GamificationUIState>((set) => ({
  activeNudge: null,
  setActiveNudge: (id) => set({ activeNudge: id }),
  dismissNudge: () => set({ activeNudge: null }),
}))
