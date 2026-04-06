// ─── Global Shared Types ─────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'night' | 'eye-protection';

export type FileType = 'pdf' | 'word' | 'ppt' | 'image' | 'unknown';

export type FontSize = 'small' | 'medium' | 'large';

export interface BookMeta {
  fileName: string;
  fileSize: number;
  totalPages: number;
  fileType: FileType;
}

export interface ReadingProgress {
  fileName: string;
  currentPage: number;
  lastRead: number; // timestamp
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
  duration?: number;
}

export interface ZoomState {
  level: number;
  min: number;
  max: number;
  step: number;
}
