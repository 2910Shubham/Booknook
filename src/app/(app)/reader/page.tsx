'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { usePdfStore } from '@/store/pdfStore';
import ReaderLayout from '@/features/reader/components/ReaderLayout';
import {
    deleteLocalFile,
    getLocalBook,
    getLocalFile,
    isLocalBookId,
    removeLocalBook,
    updateLocalLastOpened,
} from '@/lib/localLibrary';

export default function ReaderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookIdParam = searchParams.get('bookId');

    const file = usePdfStore((s) => s.file);
    const currentBookId = usePdfStore((s) => s.bookId);
    const setPdfFile = usePdfStore((s) => s.setFile);
    const setBookId = usePdfStore((s) => s.setBookId);
    const clearFile = usePdfStore((s) => s.clearFile);

    const [loadingRemote, setLoadingRemote] = useState(false);

    useEffect(() => {
        if (!bookIdParam) {
            setBookId(null);
            clearFile();
            router.replace('/library');
            return;
        }

        const isSameBookLoaded = bookIdParam === currentBookId && !!file;
        const isLocal = isLocalBookId(bookIdParam);

        if (isSameBookLoaded) {
            if (isLocal) {
                updateLocalLastOpened(bookIdParam, new Date().toISOString());
            }
            return;
        }

        let cancelled = false;
        const loadRemote = async () => {
            setLoadingRemote(true);
            setBookId(bookIdParam);
            try {
                if (isLocal) {
                    if (file) {
                        updateLocalLastOpened(bookIdParam, new Date().toISOString());
                        return;
                    }

                    const localBook = getLocalBook(bookIdParam);
                    if (!localBook) {
                        throw new Error('Local book missing.');
                    }
                    const blob = await getLocalFile(bookIdParam);
                    if (!blob) {
                        throw new Error('Local file missing.');
                    }
                    const buffer = await blob.arrayBuffer();
                    if (cancelled) return;
                    setPdfFile(buffer, localBook.file_name, localBook.file_size ?? 0);
                    updateLocalLastOpened(bookIdParam, new Date().toISOString());
                    return;
                }

                const bookRes = await fetch(`/api/books/${bookIdParam}`, {
                    credentials: 'include',
                });
                if (!bookRes.ok) {
                    throw new Error('Book not found.');
                }
                const bookType = bookRes.headers.get('content-type') ?? '';
                if (!bookType.includes('application/json')) {
                    throw new Error('Book not found.');
                }
                const { book } = await bookRes.json();

                const signedRes = await fetch(
                    `/api/books/${bookIdParam}/signed-url`,
                    { credentials: 'include' },
                );
                if (!signedRes.ok) {
                    throw new Error('Unable to load book.');
                }
                const signedType = signedRes.headers.get('content-type') ?? '';
                if (!signedType.includes('application/json')) {
                    throw new Error('Unable to load book.');
                }
                const { url } = await signedRes.json();
                const fileRes = await fetch(url);
                const buffer = await fileRes.arrayBuffer();

                if (cancelled) return;
                setPdfFile(buffer, book.file_name, book.file_size ?? 0);

                void fetch(`/api/books/${bookIdParam}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ lastOpened: true }),
                });
            } catch {
                if (!cancelled) {
                    if (isLocal) {
                        removeLocalBook(bookIdParam);
                        await deleteLocalFile(bookIdParam);
                    }
                    clearFile();
                    router.replace('/library');
                }
            } finally {
                if (!cancelled) setLoadingRemote(false);
            }
        };

        void loadRemote();
        return () => {
            cancelled = true;
        };
    }, [bookIdParam, clearFile, file, router, setBookId, setPdfFile, currentBookId]);

    const handleClose = () => {
        clearFile();
        router.push('/');
    };

    if (!file && loadingRemote) {
        return (
            <div className="reader-empty">
                <div className="reader-empty-card">
                    <div className="reader-empty-title">Loading book...</div>
                    <p className="reader-empty-text">
                        Preparing your reading session.
                    </p>
                </div>
            </div>
        );
    }

    if (!file) {
        return (
            <div className="reader-empty">
                <div className="reader-empty-card">
                    <div className="reader-empty-title">No book loaded</div>
                    <p className="reader-empty-text">
                        Upload a PDF from your library to start reading.
                    </p>
                    <Button
                        variant="filled"
                        size="lg"
                        onClick={() => router.push('/library?upload=1')}
                    >
                        Upload a PDF
                    </Button>
                </div>
            </div>
        );
    }

    return <ReaderLayout onClose={handleClose} />;
}
