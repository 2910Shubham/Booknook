'use client';

import React, { useState } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { X, Upload, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'select' | 'uploading' | 'complete'>('select');
  const addBook = useLibraryStore((s) => s.addBook);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStage('uploading');
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(95, p + 5));
    }, 100);

    try {
      // In a real app:
      // 1. Upload to Supabase Storage
      // 2. Insert into 'books' table
      // 3. Update library store
      
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
      const id = uuidv4();
      
      // Simulating successful upload
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setStage('complete');
        
        const newBook = {
          id,
          user_id: 'user_1',
          title: file.name.replace(/\.[^/.]+$/, ""),
          file_name: file.name,
          file_path: URL.createObjectURL(file), // Using local URL for simulation
          file_size: file.size,
          total_pages: 0,
          file_type: fileType,
          cover_color: '#c8965a',
          uploaded_at: new Date().toISOString(),
          last_opened: null,
        };
        
        addBook(newBook);
        
        setTimeout(() => {
          onClose();
        }, 1500);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setStage('select');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {stage === 'select' && (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent transition-colors group"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-zinc-400 group-hover:text-accent" size={32} />
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                  {file ? file.name : 'Click or drop file to upload'}
                </p>
                <p className="text-xs text-zinc-400 mt-2">PDF, PNG, JPG up to 50MB</p>
                <input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                />
              </div>

              <button 
                onClick={startUpload}
                disabled={!file}
                className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Upload
              </button>
            </div>
          )}

          {stage === 'uploading' && (
            <div className="flex flex-col items-center py-8">
              <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-zinc-100 dark:text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - progress / 100)}
                    className="text-accent transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold">
                  {progress}%
                </div>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">Processing document...</p>
            </div>
          )}

          {stage === 'complete' && (
            <div className="flex flex-col items-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to read!</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Your document has been added successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}