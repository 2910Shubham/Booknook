// ─── Keyboard Shortcut Definitions ───────────────────────────────────────────

export const SHORTCUTS = {
    PREV_PAGE: 'ArrowLeft',
    NEXT_PAGE: 'ArrowRight',
    TOGGLE_FOCUS: 'f',
    ZOOM_IN: '+',
    ZOOM_OUT: '-',
    ZOOM_RESET: '0',
    TOGGLE_FULLSCREEN: 'F11',
} as const;

export const SHORTCUT_LABELS: Record<string, string> = {
    [SHORTCUTS.PREV_PAGE]: '←',
    [SHORTCUTS.NEXT_PAGE]: '→',
    [SHORTCUTS.TOGGLE_FOCUS]: 'F',
    [SHORTCUTS.ZOOM_IN]: '+',
    [SHORTCUTS.ZOOM_OUT]: '−',
    [SHORTCUTS.ZOOM_RESET]: '0',
};
