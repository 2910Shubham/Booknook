import { create } from 'zustand';
import type { ReadingProgress } from '@/types/database';
import { STORAGE_KEYS } from '@/lib/constants';
import { getStorageItem } from '@/lib/storage';
import { getLocalLibrary } from '@/lib/localLibrary';

type LocalReadingProgress = {
    fileName: string;
    currentPage: number;
    lastRead: number;
};

export type BookWithProgress = Book & {
    progress: ReadingProgress | null;
};

interface LibraryState {
    books: BookWithProgress[];
    isLoading: boolean;
    error: string | null;
    fetchBooks: () => Promise<void>;
    addBook: (book: BookWithProgress) => void;
    removeBook: (bookId: string) => void;
    updateBookProgress: (bookId: string, page: number) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    books: [],
    isLoading: false,
    error: null,

    fetchBooks: async () => {
        set({ isLoading: true, error: null });
        try {
            const localProgress = getStorageItem<Record<string, LocalReadingProgress>>(
                STORAGE_KEYS.READING_PROGRESS,
                {},
            );
            const localBooks = getLocalLibrary().map((book) => {
                const progressEntry = localProgress[book.file_name];
                const progress: ReadingProgress | null = progressEntry
                    ? {
                          id: `${book.id}-progress`,
                          user_id: 'local',
                          book_id: book.id,
                          current_page: progressEntry.currentPage,
                          total_pages: book.total_pages,
                          last_read_at: new Date(progressEntry.lastRead).toISOString(),
                          total_time_read: 0,
                      }
                    : null;

                return {
                    ...book,
                    user_id: 'local',
                    file_path: null,
                    progress,
                } satisfies BookWithProgress;
            });

            const response = await fetch('/api/books', {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch books.');
            }
            const contentType = response.headers.get('content-type') ?? '';
            if (!contentType.includes('application/json')) {
                throw new Error('Failed to fetch books.');
            }
            const data = await response.json();
            const remoteBooks = data.books ?? [];

            const merged = [...localBooks, ...remoteBooks];
            set({ books: merged, isLoading: false });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to fetch books.';
            const localProgress = getStorageItem<Record<string, LocalReadingProgress>>(
                STORAGE_KEYS.READING_PROGRESS,
                {},
            );
            const localBooks = getLocalLibrary().map((book) => {
                const progressEntry = localProgress[book.file_name];
                const progress: ReadingProgress | null = progressEntry
                    ? {
                          id: `${book.id}-progress`,
                          user_id: 'local',
                          book_id: book.id,
                          current_page: progressEntry.currentPage,
                          total_pages: book.total_pages,
                          last_read_at: new Date(progressEntry.lastRead).toISOString(),
                          total_time_read: 0,
                      }
                    : null;

                return {
                    ...book,
                    user_id: 'local',
                    file_path: null,
                    progress,
                } satisfies BookWithProgress;
            });
            set({ error: message, books: localBooks, isLoading: false });
        }
    },

    addBook: (book) => set((state) => ({ books: [book, ...state.books] })),

    removeBook: (bookId) =>
        set((state) => ({
            books: state.books.filter((book) => book.id !== bookId),
        })),

    updateBookProgress: (bookId, page) =>
        set((state) => ({
            books: state.books.map((book) =>
                book.id === bookId && book.progress
                    ? {
                          ...book,
                          progress: { ...book.progress, current_page: page },
                      }
                    : book,
            ),
        })),
}));
