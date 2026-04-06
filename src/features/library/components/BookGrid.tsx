'use client';

import React from 'react';
import type { BookWithProgress } from '@/store/libraryStore';
import BookCard from './BookCard';

interface BookGridProps {
    books: BookWithProgress[];
    onDelete: (bookId: string) => void;
}

export default function BookGrid({ books, onDelete }: BookGridProps) {
    return (
        <div className="library-grid">
            {books.map((book) => (
                <BookCard key={book.id} book={book} onDelete={onDelete} />
            ))}
        </div>
    );
}
