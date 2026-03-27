'use client';

import { useSettingsStore } from '@/store/settingsStore';

export function useReaderSettings() {
    const theme = useSettingsStore((s) => s.theme);
    const fontSize = useSettingsStore((s) => s.fontSize);
    const setTheme = useSettingsStore((s) => s.setTheme);
    const setFontSize = useSettingsStore((s) => s.setFontSize);

    return { theme, fontSize, setTheme, setFontSize };
}
