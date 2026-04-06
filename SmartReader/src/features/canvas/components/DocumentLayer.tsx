'use client';

import React, { useState } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import PDFDocument from './PDFDocument';
import ImageDocument from './ImageDocument';

export default function DocumentLayer() {
  const activeBookId = useLibraryStore((s) => s.activeBookId);
  const books = useLibraryStore((s) => s.books);
  
  const activeBook = books.find(b => b.id === activeBookId);

  if (!activeBook) {
    return (
      <div className="flex items-center justify-center w-full h-full text-zinc-400">
        Select a book to start reading
      </div>
    );
  }

  const isUnsupported = ['word', 'ppt'].includes(activeBook.file_type);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-zinc-800 transition-shadow">
        {isUnsupported ? (
          <div className="p-12 text-center max-w-md">
            <h3 className="text-xl font-bold mb-4">Direct Preview Not Supported</h3>
            <p className="text-zinc-500">
              {activeBook.file_type.toUpperCase()} files cannot be rendered directly in the browser yet.
              Please convert to PDF for the best smart board experience.
            </p>
          </div>
        ) : activeBook.file_type === 'pdf' ? (
          <PDFDocument book={activeBook} />
        ) : (
          <ImageDocument book={activeBook} />
        )}
      </div>
    </div>
  );
}