'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePdfStore } from '@/store/pdfStore';
import Header from '@/components/layout/Header';
import UploadZone from '@/features/upload/components/UploadZone';
import FilePreview from '@/features/upload/components/FilePreview';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const fileName = usePdfStore((s) => s.fileName);
  const fileSize = usePdfStore((s) => s.fileSize);
  const file = usePdfStore((s) => s.file);
  const [uploaded, setUploaded] = useState(false);

  const handleUploadSuccess = () => {
    setUploaded(true);
  };

  const handleOpen = () => {
    router.push('/reader');
  };

  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <div className="home-hero">
          <h1 className="home-title">{APP_NAME}</h1>
          <p className="home-subtitle">{APP_DESCRIPTION}</p>
        </div>

        <div className="home-upload-section">
          {uploaded && file ? (
            <FilePreview
              fileName={fileName}
              fileSize={fileSize}
              onOpen={handleOpen}
            />
          ) : (
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          )}
        </div>

        <div className="home-features">
          <div className="home-feature">
            <span className="home-feature-icon">◐</span>
            <div>
              <h3 className="home-feature-title">Reading Themes</h3>
              <p className="home-feature-text">
                Light, Dark, Sepia, and Night modes for every environment
              </p>
            </div>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon">⊹</span>
            <div>
              <h3 className="home-feature-title">Remember Progress</h3>
              <p className="home-feature-text">
                Picks up right where you left off, automatically
              </p>
            </div>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon">◇</span>
            <div>
              <h3 className="home-feature-title">Distraction Free</h3>
              <p className="home-feature-text">
                Focus mode hides everything but the page
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>Built for readers who value simplicity</p>
      </footer>
    </div>
  );
}
