import { STORAGE_KEYS } from '@/lib/constants';
import { getStorageItem, setStorageItem } from '@/lib/storage';

export const LOCAL_BOOK_PREFIX = 'local_';

export type LocalBookMeta = {
    id: string;
    title: string;
    file_name: string;
    file_size: number;
    total_pages: number;
    file_type: string;
    cover_color: string;
    uploaded_at: string;
    last_opened: string | null;
};

const DB_NAME = 'booknook_local_books';
const DB_VERSION = 1;
const FILE_STORE = 'files';

const colorPalette = ['#c8965a', '#b57d4b', '#9f6c3f', '#d4a46a', '#8a5a34'];

const hashString = (value: string) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) + hash + value.charCodeAt(i);
        hash &= hash;
    }
    return Math.abs(hash).toString(36);
};

export const isLocalBookId = (id?: string | null) =>
    typeof id === 'string' && id.startsWith(LOCAL_BOOK_PREFIX);

const pickCoverColor = (seed: string) => {
    const numeric = Number.parseInt(hashString(seed), 36);
    const index = Number.isFinite(numeric)
        ? Math.abs(numeric) % colorPalette.length
        : 0;
    return colorPalette[index] ?? colorPalette[0];
};

export const createLocalBookMeta = (
    file: File,
    totalPages: number,
    title: string,
    fileType: string,
): LocalBookMeta => {
    const seed = `${file.name}-${file.size}-${file.lastModified}`;
    const id = `${LOCAL_BOOK_PREFIX}${hashString(seed)}`;
    const now = new Date().toISOString();
    return {
        id,
        title,
        file_name: file.name,
        file_size: file.size,
        total_pages: totalPages,
        file_type: fileType,
        cover_color: pickCoverColor(seed),
        uploaded_at: now,
        last_opened: null,
    };
};

export const getLocalLibrary = () =>
    getStorageItem<LocalBookMeta[]>(STORAGE_KEYS.LOCAL_LIBRARY, []);

const setLocalLibrary = (books: LocalBookMeta[]) =>
    setStorageItem(STORAGE_KEYS.LOCAL_LIBRARY, books);

export const getLocalBook = (id: string) =>
    getLocalLibrary().find((book) => book.id === id) ?? null;

export const upsertLocalBook = (book: LocalBookMeta) => {
    const library = getLocalLibrary();
    const existingIndex = library.findIndex((entry) => entry.id === book.id);
    if (existingIndex >= 0) {
        library[existingIndex] = { ...library[existingIndex], ...book };
    } else {
        library.unshift(book);
    }
    setLocalLibrary(library);
};

export const updateLocalLastOpened = (id: string, iso: string) => {
    const library = getLocalLibrary();
    const next = library.map((entry) =>
        entry.id === id ? { ...entry, last_opened: iso } : entry,
    );
    setLocalLibrary(next);
};

export const removeLocalBook = (id: string) => {
    const library = getLocalLibrary().filter((entry) => entry.id !== id);
    setLocalLibrary(library);
};

const openDb = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
            reject(new Error('IndexedDB unavailable.'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(FILE_STORE)) {
                db.createObjectStore(FILE_STORE);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

const withStore = async <T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> => {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(FILE_STORE, mode);
            const store = tx.objectStore(FILE_STORE);
            const request = handler(store);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return null;
    }
};

export const saveLocalFile = async (id: string, file: Blob) => {
    await withStore('readwrite', (store) => store.put(file, id));
};

export const getLocalFile = async (id: string): Promise<Blob | null> =>
    (await withStore('readonly', (store) => store.get(id))) ?? null;

export const deleteLocalFile = async (id: string) => {
    await withStore('readwrite', (store) => store.delete(id));
};
