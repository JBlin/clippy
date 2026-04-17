import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const { createJSONStorage, persist } = require('zustand/middleware') as typeof import('zustand/middleware');

import { STORAGE_KEYS } from '@/constants/storage';

export type ColorMode = 'light' | 'dark';
export type LinkViewMode = 'card' | 'list';

interface ThemeStoreState {
  colorMode: ColorMode;
  linkViewMode: LinkViewMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setLinkViewMode: (mode: LinkViewMode) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      colorMode: 'light',
      linkViewMode: 'card',
      setColorMode: (mode) => set({ colorMode: mode }),
      toggleColorMode: () =>
        set((state) => ({
          colorMode: state.colorMode === 'dark' ? 'light' : 'dark',
        })),
      setLinkViewMode: (mode) => set({ linkViewMode: mode }),
    }),
    {
      name: STORAGE_KEYS.preferences,
      partialize: (state) => ({
        colorMode: state.colorMode,
        linkViewMode: state.linkViewMode,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
