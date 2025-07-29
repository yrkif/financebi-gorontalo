import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '@/types';

interface AppStore extends AppState {
  toggleDarkMode: () => void;
  toggleShowBalance: () => void;
  setCurrentPage: (page: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  setShowBalance: (showBalance: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: false,
      showBalance: true,
      currentPage: 'dashboard',

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      toggleShowBalance: () =>
        set((state) => ({
          showBalance: !state.showBalance,
        })),

      setCurrentPage: (currentPage: string) => set({ currentPage }),

      setDarkMode: (darkMode: boolean) => set({ darkMode }),

      setShowBalance: (showBalance: boolean) => set({ showBalance }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        showBalance: state.showBalance,
      }),
    }
  )
);
