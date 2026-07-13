import { create } from "zustand"

/**
 * Global UI state: sidebar and mobile navigation visibility.
 * Consumed by the app shell (sidebar, topbar, mobile-nav) in ticket #25.
 */
interface UiState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}))
