import { create } from 'zustand'

interface ResearchDoc {
  ticker: string
  fileName: string
  content: string
  uploadedAt: string
}

interface StockResearchState {
  docs: Record<string, ResearchDoc>
  setDoc: (ticker: string, fileName: string, content: string) => void
  removeDoc: (ticker: string) => void
}

export const useStockResearchStore = create<StockResearchState>((set) => ({
  docs: {},
  setDoc: (ticker, fileName, content) =>
    set((state) => ({
      docs: {
        ...state.docs,
        [ticker.toUpperCase()]: { ticker: ticker.toUpperCase(), fileName, content, uploadedAt: new Date().toISOString() },
      },
    })),
  removeDoc: (ticker) =>
    set((state) => {
      const next = { ...state.docs }
      delete next[ticker.toUpperCase()]
      return { docs: next }
    }),
}))
