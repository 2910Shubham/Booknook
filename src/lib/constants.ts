// ─── Application Constants ───────────────────────────────────────────────────

export const APP_NAME = 'BookNook';
export const APP_DESCRIPTION = 'A refined PDF reading experience';

// PDF Constants
export const ACCEPTED_FILE_TYPES = '.pdf';
export const ACCEPTED_MIME_TYPES = ['application/pdf'];
export const MAX_FILE_SIZE_MB = 200;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Zoom Constants
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.1;
export const ZOOM_DEFAULT = 1.0;
export const ZOOM_FIT_PADDING = 40; // px padding for fit-to-width

// Animation Constants
export const PAGE_TRANSITION_DURATION = 200; // ms
export const TOAST_DURATION = 3000; // ms
export const TOAST_FADE_DURATION = 300; // ms

// LocalStorage Keys
export const STORAGE_KEYS = {
    THEME: 'booknook-theme',
    FONT_SIZE: 'booknook-font-size',
    READING_PROGRESS: 'booknook-reading-progress',
} as const;

// PDF.js Worker — matching installed pdfjs-dist@5.5.207
export const PDFJS_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;

// Font Size Map
export const FONT_SIZE_MAP = {
    small: '14px',
    medium: '16px',
    large: '18px',
} as const;

export const FONT_SIZE_LABELS = {
    small: 'S',
    medium: 'M',
    large: 'L',
} as const;
