'use client';

import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function useFocusMode() {
    const focusMode = useSettingsStore((s) => s.focusMode);
    const toggleFocusMode = useSettingsStore((s) => s.toggleFocusMode);
    const setFocusMode = useSettingsStore((s) => s.setFocusMode);

    const exitFocus = useCallback(() => setFocusMode(false), [setFocusMode]);

    return { focusMode, toggleFocusMode, exitFocus };
}
