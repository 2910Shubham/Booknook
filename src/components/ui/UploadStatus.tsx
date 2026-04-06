'use client';

import React, { useEffect } from 'react';
import { Check, XCircle, UploadCloud } from 'lucide-react';
import { useUploadStore } from '@/store/uploadStore';

export default function UploadStatus() {
    const { status, fileName, progress, error, reset } = useUploadStore();

    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const timer = setTimeout(() => reset(), 4000);
            return () => clearTimeout(timer);
        }
        return;
    }, [status, reset]);

    if (status === 'idle') return null;

    return (
        <div className="upload-status">
            {status === 'uploading' && (
                <>
                    <UploadCloud size={16} />
                    <span className="upload-status-text">
                        Uploading {fileName} {progress}%
                    </span>
                </>
            )}
            {status === 'success' && (
                <>
                    <Check size={16} />
                    <span className="upload-status-text">Upload complete</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <XCircle size={16} />
                    <span className="upload-status-text">
                        Upload failed{error ? `: ${error}` : ''}
                    </span>
                </>
            )}
        </div>
    );
}
