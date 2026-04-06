import { create } from 'zustand';
import { Book } from '@/types/database';

interface LibraryState {
  books: Book[];
  activeBookId: string | null;
  isLoading: boolean;
  error: string | null;

  setBooks: (books: Book[]) => void;
  setActiveBookId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  activeBookId: null,
  isLoading: false,
  error: null,

  setBooks: (books) => set({ books }),
  setActiveBookId: (activeBookId) => set({ activeBookId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addBook: (book) => set((state) => ({ books: [book, ...state.books] })),
  removeBook: (id) => set((state) => ({ books: state.books.filter(b => b.id !== id) })),
}));