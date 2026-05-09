import { create } from 'zustand'

interface PortfolioUIStore {
  drawerOpen: boolean
  editingId: string | null
  wizardOpen: boolean
  quickAddGroup: string | null
  openAdd: () => void
  openEdit: (id: string) => void
  closeDrawer: () => void
  openWizard: () => void
  closeWizard: () => void
  openQuickAdd: (groupId: string) => void
  closeQuickAdd: () => void
}

export const usePortfolioUIStore = create<PortfolioUIStore>((set) => ({
  drawerOpen: false,
  editingId: null,
  wizardOpen: false,
  quickAddGroup: null,
  openAdd: () => set({ drawerOpen: true, editingId: null }),
  openEdit: (id) => set({ drawerOpen: true, editingId: id }),
  closeDrawer: () => set({ drawerOpen: false, editingId: null }),
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () => set({ wizardOpen: false }),
  openQuickAdd: (groupId) => set({ quickAddGroup: groupId }),
  closeQuickAdd: () => set({ quickAddGroup: null }),
}))
