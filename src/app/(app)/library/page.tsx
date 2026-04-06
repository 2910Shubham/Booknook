'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Spinner from '@/components/ui/Spinner';
import LibraryHeader from '@/features/library/components/LibraryHeader';
import BookGrid from '@/features/library/components/BookGrid';
import EmptyState from '@/features/library/components/EmptyState';
import UploadFAB from '@/features/library/components/UploadFAB';
import dynamic from 'next/dynamic';

const UploadModal = dynamic(
    () => import('@/features/library/components/UploadModal'),
    { ssr: false },
);
import { useLibraryStore } from '@/store/libraryStore';
import { deleteLocalFile, isLocalBookId, removeLocalBook } from '@/lib/localLibrary';

export default function LibraryPage() {
    const { books, isLoading, error, fetchBooks, removeBook } = useLibraryStore();
    const [isUploadOpen, setUploadOpen] = useState(false);
    const searchParams = useSearchParams();
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        fetchBooks();
    }, [fetchBooks, isLoaded, isSignedIn]);

    useEffect(() => {
        if (searchParams.get('upload') === '1') {
            setUploadOpen(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        const shouldSync = searchParams.get('sync') === '1';
        if (typeof window === 'undefined') return;
        const hasSynced =
            window.localStorage.getItem('booknook_profile_synced') === '1';
        if (hasSynced && !shouldSync) return;

        const syncProfile = async () => {
            try {
                const response = await fetch('/api/users/sync', { method: 'POST' });
                if (response.ok) {
                    window.localStorage.setItem('booknook_profile_synced', '1');
                }
            } catch {
                // Silently ignore and retry next visit.
            }
        };

        void syncProfile();
    }, [searchParams, isLoaded, isSignedIn]);

    const handleDelete = async (bookId: string) => {
        if (isLocalBookId(bookId)) {
            removeLocalBook(bookId);
            removeBook(bookId);
            await deleteLocalFile(bookId);
            return;
        }

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete book.');
            }
            removeBook(bookId);
        } catch {
            // no-op for now
        }
    };

    return (
        <div className="library-page">
            <LibraryHeader count={books.length} />
            <main className="library-main">
                {isLoading && (
                    <div className="library-loading">
                        <Spinner size={32} />
                        <span>Loading your library...</span>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="library-error">{error}</div>
                )}

                {!isLoading && !error && books.length === 0 && (
                    <EmptyState onUpload={() => setUploadOpen(true)} />
                )}

                {!isLoading && books.length > 0 && (
                    <BookGrid books={books} onDelete={handleDelete} />
                )}
            </main>

            <UploadFAB onClick={() => setUploadOpen(true)} />
            <UploadModal open={isUploadOpen} onClose={() => setUploadOpen(false)} />
        </div>
    );
}
