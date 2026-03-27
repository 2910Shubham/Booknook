import { ThemeMode } from '@/types';

// ─── Theme Color Tokens ──────────────────────────────────────────────────────
// Each theme defines CSS custom property values.
// These are applied via ThemeProvider as data-theme attribute.

export interface ThemeColors {
    '--bg-primary': string;
    '--bg-secondary': string;
    '--bg-surface': string;
    '--bg-overlay': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--text-accent': string;
    '--border-primary': string;
    '--border-subtle': string;
    '--accent': string;
    '--accent-hover': string;
    '--accent-muted': string;
    '--canvas-bg': string;
    '--toolbar-bg': string;
    '--toolbar-border': string;
    '--button-bg': string;
    '--button-hover': string;
    '--button-text': string;
    '--toast-bg': string;
    '--toast-text': string;
    '--scrollbar-track': string;
    '--scrollbar-thumb': string;
    '--shadow-color': string;
}

export const THEME_MAP: Record<ThemeMode, ThemeColors> = {
    light: {
        '--bg-primary': '#faf8f5',
        '--bg-secondary': '#f0ece6',
        '--bg-surface': '#ffffff',
        '--bg-overlay': 'rgba(250, 248, 245, 0.92)',
        '--text-primary': '#2c2825',
        '--text-secondary': '#5c5650',
        '--text-muted': '#9a948d',
        '--text-accent': '#8b6914',
        '--border-primary': '#e0dbd4',
        '--border-subtle': '#ebe7e1',
        '--accent': '#a37b1e',
        '--accent-hover': '#8b6914',
        '--accent-muted': 'rgba(163, 123, 30, 0.12)',
        '--canvas-bg': '#f5f2ed',
        '--toolbar-bg': 'rgba(255, 255, 255, 0.88)',
        '--toolbar-border': '#e0dbd4',
        '--button-bg': 'transparent',
        '--button-hover': 'rgba(44, 40, 37, 0.06)',
        '--button-text': '#5c5650',
        '--toast-bg': '#2c2825',
        '--toast-text': '#faf8f5',
        '--scrollbar-track': '#f0ece6',
        '--scrollbar-thumb': '#cdc7bf',
        '--shadow-color': 'rgba(44, 40, 37, 0.08)',
    },
    dark: {
        '--bg-primary': '#1a1410',
        '--bg-secondary': '#241e18',
        '--bg-surface': '#2a2320',
        '--bg-overlay': 'rgba(26, 20, 16, 0.94)',
        '--text-primary': '#e8dfd4',
        '--text-secondary': '#b5a898',
        '--text-muted': '#7a6e62',
        '--text-accent': '#d4a44a',
        '--border-primary': '#3a332d',
        '--border-subtle': '#2f2924',
        '--accent': '#d4a44a',
        '--accent-hover': '#e0b45c',
        '--accent-muted': 'rgba(212, 164, 74, 0.15)',
        '--canvas-bg': '#201a15',
        '--toolbar-bg': 'rgba(36, 30, 24, 0.92)',
        '--toolbar-border': '#3a332d',
        '--button-bg': 'transparent',
        '--button-hover': 'rgba(232, 223, 212, 0.08)',
        '--button-text': '#b5a898',
        '--toast-bg': '#e8dfd4',
        '--toast-text': '#1a1410',
        '--scrollbar-track': '#241e18',
        '--scrollbar-thumb': '#4a413a',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    },
    sepia: {
        '--bg-primary': '#f4ede4',
        '--bg-secondary': '#e8dfd4',
        '--bg-surface': '#faf5ee',
        '--bg-overlay': 'rgba(244, 237, 228, 0.92)',
        '--text-primary': '#3e3229',
        '--text-secondary': '#6b5b4d',
        '--text-muted': '#9a8a7a',
        '--text-accent': '#7a5a2e',
        '--border-primary': '#d4c9ba',
        '--border-subtle': '#ddd3c6',
        '--accent': '#8b6a35',
        '--accent-hover': '#7a5a2e',
        '--accent-muted': 'rgba(139, 106, 53, 0.12)',
        '--canvas-bg': '#efe7dc',
        '--toolbar-bg': 'rgba(250, 245, 238, 0.90)',
        '--toolbar-border': '#d4c9ba',
        '--button-bg': 'transparent',
        '--button-hover': 'rgba(62, 50, 41, 0.06)',
        '--button-text': '#6b5b4d',
        '--toast-bg': '#3e3229',
        '--toast-text': '#f4ede4',
        '--scrollbar-track': '#e8dfd4',
        '--scrollbar-thumb': '#c4b9aa',
        '--shadow-color': 'rgba(62, 50, 41, 0.08)',
    },
    night: {
        '--bg-primary': '#0a0808',
        '--bg-secondary': '#141010',
        '--bg-surface': '#1a1414',
        '--bg-overlay': 'rgba(10, 8, 8, 0.96)',
        '--text-primary': '#8a6060',
        '--text-secondary': '#6a4a4a',
        '--text-muted': '#4a3535',
        '--text-accent': '#8a5050',
        '--border-primary': '#2a1e1e',
        '--border-subtle': '#1f1616',
        '--accent': '#8a5050',
        '--accent-hover': '#9a6060',
        '--accent-muted': 'rgba(138, 80, 80, 0.15)',
        '--canvas-bg': '#0e0a0a',
        '--toolbar-bg': 'rgba(20, 16, 16, 0.95)',
        '--toolbar-border': '#2a1e1e',
        '--button-bg': 'transparent',
        '--button-hover': 'rgba(138, 96, 96, 0.10)',
        '--button-text': '#6a4a4a',
        '--toast-bg': '#8a6060',
        '--toast-text': '#0a0808',
        '--scrollbar-track': '#141010',
        '--scrollbar-thumb': '#3a2828',
        '--shadow-color': 'rgba(0, 0, 0, 0.5)',
    },
};

export const THEME_LABELS: Record<ThemeMode, string> = {
    light: 'Light',
    dark: 'Dark',
    sepia: 'Sepia',
    night: 'Night',
};

export const THEME_PREVIEW_COLORS: Record<ThemeMode, { bg: string; fg: string }> = {
    light: { bg: '#faf8f5', fg: '#2c2825' },
    dark: { bg: '#1a1410', fg: '#e8dfd4' },
    sepia: { bg: '#f4ede4', fg: '#3e3229' },
    night: { bg: '#0a0808', fg: '#8a6060' },
};
