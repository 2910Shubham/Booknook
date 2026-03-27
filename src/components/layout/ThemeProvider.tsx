'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { THEME_MAP } from '@/config/theme';
import { FONT_SIZE_MAP } from '@/lib/constants';

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useSettingsStore((s) => s.theme);
    const fontSize = useSettingsStore((s) => s.fontSize);
    const hydrate = useSettingsStore((s) => s.hydrate);

    // Hydrate from localStorage on mount
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // Apply theme CSS custom properties
    useEffect(() => {
        const root = document.documentElement;
        const colors = THEME_MAP[theme];

        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        root.setAttribute('data-theme', theme);
    }, [theme]);

    // Apply font size
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--ui-font-size',
            FONT_SIZE_MAP[fontSize],
        );
    }, [fontSize]);

    return <>{children}</>;
}
