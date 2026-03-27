'use client';

import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FilePreviewProps {
    fileName: string;
    fileSize: number;
    onOpen: () => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePreview({
    fileName,
    fileSize,
    onOpen,
}: FilePreviewProps) {
    return (
        <div className="file-preview">
            <div className="file-preview-icon">
                <FileText size={24} strokeWidth={1.5} />
            </div>
            <div className="file-preview-info">
                <p className="file-preview-name" title={fileName}>
                    {fileName}
                </p>
                <p className="file-preview-size">{formatFileSize(fileSize)}</p>
            </div>
            <Button variant="filled" size="md" onClick={onOpen} className="file-preview-open">
                Open
                <ArrowRight size={16} strokeWidth={1.5} />
            </Button>
        </div>
    );
}
