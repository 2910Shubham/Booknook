import { create } from 'zustand';
import { ThemeMode, FontSize } from '@/types';

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
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  fontSize: 'medium',
  focusMode: false,
  isSettingsOpen: false,

  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setFocusMode: (focusMode) => set({ focusMode }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}));