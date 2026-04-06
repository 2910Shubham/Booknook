import { create } from 'zustand';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
    status: UploadStatus;
    fileName: string;
    progress: number;
    error: string | null;
    startUpload: (fileName: string) => void;
    setProgress: (progress: number) => void;
    succeed: () => void;
    fail: (message: string) => void;
    reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
    status: 'idle',
    fileName: '',
    progress: 0,
    error: null,

    startUpload: (fileName) =>
        set({ status: 'uploading', fileName, progress: 0, error: null }),

    setProgress: (progress) =>
        set({ progress: Math.max(0, Math.min(100, Math.round(progress))) }),

    succeed: () => set({ status: 'success', progress: 100 }),

    fail: (message) =>
        set({ status: 'error', error: message, progress: 0 }),

    reset: () => set({ status: 'idle', fileName: '', progress: 0, error: null }),
}));
