'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Book } from '@/types/database';
import { useSettingsStore } from '@/store/settingsStore';

// Set up worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PDFDocumentProps {
  book: Book;
}

export default function PDFDocument({ book }: PDFDocumentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    if (!book.file_path) return;
    
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(book.file_path!);
        const doc = await loadingTask.promise;
        setPdf(doc);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [book.file_path]);

  useEffect(() => {
    if (!pdf) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale]);

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
      <canvas 
        ref={canvasRef} 
        className="max-w-full"
        style={{ filter: getFilter() }}
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-sm flex gap-4">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="disabled:opacity-30"
        >
          Prev
        </button>
        <span>{currentPage} / {pdf?.numPages || '?'}</span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(pdf?.numPages || 1, p + 1))}
          disabled={currentPage === (pdf?.numPages || 1)}
          className="disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}