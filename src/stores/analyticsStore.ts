/**
 * Analytics Store - Zustand store for managing smart analytics panel
 * 
 * This store handles:
 * - Analytics panel open/close state
 * - Analytics data caching
 * - Real-time metrics updates
 */

import { create } from 'zustand';

interface AnalyticsState {
  isPanelOpen: boolean;
  lastUpdateTime: Date | null;
  refreshInterval: number; // in milliseconds
}

interface AnalyticsActions {
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setRefreshInterval: (interval: number) => void;
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set) => ({
  // State
  isPanelOpen: false,
  lastUpdateTime: null,
  refreshInterval: 30000, // 30 seconds

  // Actions
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setRefreshInterval: (interval: number) => set({ refreshInterval: interval }),
}));
