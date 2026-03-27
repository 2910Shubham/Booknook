import { create } from 'zustand';
import type { ThemeMode, FontSize } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

interface SettingsState {
    theme: ThemeMode;
    fontSize: FontSize;
    focusMode: boolean;
    isSettingsOpen: boolean;

    setTheme: (theme: ThemeMode) => void;
    setFontSize: (size: FontSize) => void;
    toggleFocusMode: () => void;
    setFocusMode: (on: boolean) => void;
    openSettings: () => void;
    closeSettings: () => void;
    toggleSettings: () => void;
    hydrate: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    theme: 'dark',
    fontSize: 'medium',
    focusMode: false,
    isSettingsOpen: false,

    setTheme: (theme) => {
        set({ theme });
        setStorageItem(STORAGE_KEYS.THEME, theme);
    },

    setFontSize: (fontSize) => {
        set({ fontSize });
        setStorageItem(STORAGE_KEYS.FONT_SIZE, fontSize);
    },

    toggleFocusMode: () =>
        set((state) => ({ focusMode: !state.focusMode })),

    setFocusMode: (focusMode) => set({ focusMode }),

    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    toggleSettings: () =>
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

    hydrate: () => {
        const theme = getStorageItem<ThemeMode>(STORAGE_KEYS.THEME, 'dark');
        const fontSize = getStorageItem<FontSize>(STORAGE_KEYS.FONT_SIZE, 'medium');
        set({ theme, fontSize });
    },
}));
