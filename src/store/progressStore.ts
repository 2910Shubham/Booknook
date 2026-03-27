import { create } from 'zustand';
import type { ReadingProgress, ToastMessage } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { STORAGE_KEYS, TOAST_DURATION } from '@/lib/constants';

interface ProgressState {
    toasts: ToastMessage[];

    // Reading progress
    saveProgress: (fileName: string, currentPage: number) => void;
    getProgress: (fileName: string) => number | null;

    // Toast notifications
    addToast: (text: string, type?: ToastMessage['type']) => void;
    removeToast: (id: string) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
    toasts: [],

    saveProgress: (fileName, currentPage) => {
        const allProgress = getStorageItem<Record<string, ReadingProgress>>(
            STORAGE_KEYS.READING_PROGRESS,
            {},
        );
        allProgress[fileName] = {
            fileName,
            currentPage,
            lastRead: Date.now(),
        };
        setStorageItem(STORAGE_KEYS.READING_PROGRESS, allProgress);
    },

    getProgress: (fileName) => {
        const allProgress = getStorageItem<Record<string, ReadingProgress>>(
            STORAGE_KEYS.READING_PROGRESS,
            {},
        );
        return allProgress[fileName]?.currentPage ?? null;
    },

    addToast: (text, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const toast: ToastMessage = { id, text, type, duration: TOAST_DURATION };
        set((state) => ({ toasts: [...state.toasts, toast] }));

        // Auto-remove after duration
        setTimeout(() => {
            get().removeToast(id);
        }, TOAST_DURATION);
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
