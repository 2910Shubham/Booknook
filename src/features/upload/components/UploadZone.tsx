'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileWarning } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { ACCEPTED_FILE_TYPES } from '@/lib/constants';

interface UploadZoneProps {
    onUploadSuccess: () => void;
}

export default function UploadZone({ onUploadSuccess }: UploadZoneProps) {
    const { error, isProcessing, processFile, clearError } = useFileUpload();
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            const success = await processFile(file);
            if (success) onUploadSuccess();
        },
        [processFile, onUploadSuccess],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            clearError();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile, clearError],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleClick = () => inputRef.current?.click();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearError();
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset input so the same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="upload-zone-wrapper">
            <div
                className={`upload-zone ${isDragOver ? 'upload-zone-active' : ''} ${error ? 'upload-zone-error' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                aria-label="Upload PDF file"
                id="upload-zone"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    onChange={handleInputChange}
                    className="upload-input"
                    tabIndex={-1}
                    aria-hidden="true"
                />

                <div className="upload-zone-content">
                    <div className={`upload-icon-wrapper ${isDragOver ? 'upload-icon-active' : ''}`}>
                        <Upload size={28} strokeWidth={1.5} />
                    </div>

                    <div className="upload-text">
                        <p className="upload-text-primary">
                            {isProcessing
                                ? 'Processing…'
                                : isDragOver
                                    ? 'Drop your PDF here'
                                    : 'Drop a PDF here, or click to browse'}
                        </p>
                        <p className="upload-text-secondary">
                            PDF files only · Up to 200MB
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="upload-error" role="alert">
                        <FileWarning size={16} strokeWidth={1.5} />
                        <span>{error.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
