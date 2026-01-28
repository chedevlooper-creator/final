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

// Default initial state (same for server and client to avoid hydration mismatch)
const defaultState = {
  sidebarCollapsed: false,
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
}

export const useUIStore = create<UIState>((set, _get) => ({
  ...defaultState,
  toggleSidebar: () => {
    set((state) => {
      const newState = { sidebarCollapsed: !state.sidebarCollapsed }
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ui-storage', JSON.stringify({ state: newState }))
        } catch {
          // Ignore errors
        }
      }
      return newState
    })
  },
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed })
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ui-storage', JSON.stringify({ state: { sidebarCollapsed: collapsed } }))
      } catch {
        // Ignore errors
      }
    }
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))

// Hydrate from localStorage on client side (called once)
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('ui-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.state?.sidebarCollapsed !== undefined) {
        useUIStore.setState({ sidebarCollapsed: parsed.state.sidebarCollapsed })
      }
    }
  } catch {
    // Ignore errors
  }
}
