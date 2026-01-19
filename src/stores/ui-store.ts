import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  activeModal: string | null
  modalData: Record<string, unknown> | null
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpen: (open: boolean) => void
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  toggleSidebar: () => {
    set((state) => {
      const newState = { sidebarCollapsed: !state.sidebarCollapsed }
      // Save to localStorage (client-side only, async)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            localStorage.setItem('ui-storage', JSON.stringify({ state: newState }))
          } catch {
            // Ignore errors
          }
        }, 0)
      }
      return newState
    })
  },
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
    // Save to localStorage (client-side only, async)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          localStorage.setItem('ui-storage', JSON.stringify({ state: { sidebarCollapsed: collapsed } }))
        } catch {
          // Ignore errors
        }
      }, 0)
    }
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))
