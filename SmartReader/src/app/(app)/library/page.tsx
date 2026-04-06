'use client';

import React, { useEffect, useState } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { useCanvasStore } from '@/store/canvasStore';
import SmartBoardCanvas from '@/features/canvas/components/SmartBoardCanvas';
import UploadModal from '@/features/library/components/UploadModal';
import { Plus, Book as BookIcon, Layout } from 'lucide-react';

export default function LibraryPage() {
  const { books, activeBookId, setActiveBookId, setBooks } = useLibraryStore();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch books (simulated for now)
  useEffect(() => {
    // In a real app, fetch from /api/books
    // setBooks([...]);
  }, [setBooks]);

  const openBook = (id: string) => {
    setActiveBookId(id);
    setShowLibrary(false);
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      {/* Smart Board Canvas (always present, but maybe covered by library) */}
      <SmartBoardCanvas />

      {/* Library Overlay */}
      {showLibrary && (
        <div className="absolute inset-0 z-[100] bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            <header className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">My Sanctuary</h1>
                <p className="text-text-secondary">Your collection of knowledge and ideas</p>
              </div>
              <button 
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add Document</span>
              </button>
            </header>

            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
                  <BookIcon size={40} />
                </div>
                <h2 className="text-2xl font-semibold mb-2">No documents yet</h2>
                <p className="text-text-secondary max-w-xs mx-auto mb-8">
                  Upload your first PDF, image, or document to start your reading journey.
                </p>
                <button 
                  onClick={() => setShowUpload(true)}
                  className="text-accent font-semibold hover:underline"
                >
                  Browse files
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {books.map((book) => (
                  <div 
                    key={book.id}
                    onClick={() => openBook(book.id)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 relative">
                      <div 
                        className="absolute inset-0 flex items-center justify-center text-white/90"
                        style={{ backgroundColor: book.cover_color }}
                      >
                        <BookIcon size={48} className="opacity-20" />
                        <span className="absolute bottom-4 left-4 right-4 text-xs font-bold uppercase tracking-widest opacity-60">
                          {book.file_type}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {book.total_pages > 0 ? `${book.total_pages} pages` : 'Document'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}

      {/* Toggle Library Button (visible when board is open) */}
      {!showLibrary && (
        <button 
          onClick={() => setShowLibrary(true)}
          className="fixed bottom-6 left-6 z-[110] p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-2xl rounded-2xl text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors border border-zinc-200 dark:border-zinc-800"
          title="Back to Library"
        >
          <Layout size={24} />
        </button>
      )}
    </div>
  );
}