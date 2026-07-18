import { create } from "zustand"

/**
 * Global UI state: sidebar and mobile navigation visibility.
 * Consumed by the app shell (sidebar, topbar, mobile-nav).
 */
interface UiState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))
