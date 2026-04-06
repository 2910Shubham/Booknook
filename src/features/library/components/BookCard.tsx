'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import type { BookWithProgress } from '@/store/libraryStore';

interface BookCardProps {
    book: BookWithProgress;
    onDelete: (bookId: string) => void;
}

const getInitials = (title: string) =>
    title
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');

const formatLastRead = (value: string | null) => {
    if (!value) return 'Never opened';
    const last = new Date(value).getTime();
    const now = Date.now();
    if (!Number.isFinite(last)) return 'Never opened';
    const diff = Math.max(0, now - last);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Last read today';
    if (days === 1) return 'Last read 1 day ago';
    return `Last read ${days} days ago`;
};

export default function BookCard({ book, onDelete }: BookCardProps) {
    const router = useRouter();
    const progress = book.progress;
    const totalPages = book.total_pages || 0;
    const currentPage = progress?.current_page ?? 0;
    const percent =
        totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

    const handleOpen = () => {
        router.push(`/reader?bookId=${book.id}`);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (window.confirm('Delete this book? This cannot be undone.')) {
            onDelete(book.id);
        }
    };

    return (
        <div className="book-card" onClick={handleOpen}>
            <div
                className="book-cover"
                style={{ background: book.cover_color || '#c8965a' }}
            >
                <div className="book-cover-initials">{getInitials(book.title)}</div>
                <button
                    className="book-card-menu"
                    type="button"
                    onClick={handleDelete}
                    aria-label="Delete book"
                >
                    <MoreVertical size={16} />
                </button>
            </div>
            <div className="book-card-body">
                <div className="book-card-title">{book.title}</div>
                <div className="book-card-meta">
                    Page {currentPage || 1} of {totalPages || 0}
                </div>
                <div className="book-card-meta">{formatLastRead(book.last_opened)}</div>
                <div className="book-progress">
                    <div className="book-progress-track">
                        <div
                            className="book-progress-fill"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className="book-progress-text">{percent}%</span>
                </div>
            </div>
        </div>
    );
}
