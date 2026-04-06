'use client';

import React from 'react';
import { Book } from '@/types/database';
import { useSettingsStore } from '@/store/settingsStore';

interface ImageDocumentProps {
  book: Book;
}

export default function ImageDocument({ book }: ImageDocumentProps) {
  const theme = useSettingsStore((s) => s.theme);

  const getFilter = () => {
    switch (theme) {
      case 'dark':
        return 'invert(0.9) hue-rotate(180deg)';
      case 'sepia':
        return 'sepia(0.4) brightness(0.9)';
      case 'night':
        return 'invert(0.9) hue-rotate(180deg) brightness(0.6) sepia(0.4)';
      case 'eye-protection':
        return 'sepia(0.2) brightness(0.95) contrast(0.9)';
      default:
        return 'none';
    }
  };

  return (
    <div className="relative group overflow-hidden bg-white shadow-xl pointer-events-auto">
      <img 
        src={book.file_path || ''} 
        alt={book.title} 
        className="max-w-full max-h-[80vh] block object-contain"
        style={{ filter: getFilter() }}
      />
    </div>
  );
}