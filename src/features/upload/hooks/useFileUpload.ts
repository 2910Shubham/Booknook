'use client';

import { useState, useCallback } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import {
    ACCEPTED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
} from '@/lib/constants';
import type { UploadError } from '../types';

export function useFileUpload() {
    const [error, setError] = useState<UploadError | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const setFile = usePdfStore((s) => s.setFile);

    const validateFile = useCallback((file: File): UploadError | null => {
        if (!ACCEPTED_MIME_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
            return { message: 'Please select a PDF file', code: 'INVALID_TYPE' };
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return {
                message: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`,
                code: 'TOO_LARGE',
            };
        }
        return null;
    }, []);

    const processFile = useCallback(
        async (file: File) => {
            setError(null);
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return false;
            }

            setIsProcessing(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                setFile(arrayBuffer, file.name, file.size);
                return true;
            } catch {
                setError({ message: 'Failed to read file', code: 'READ_ERROR' });
                return false;
            } finally {
                setIsProcessing(false);
            }
        },
        [validateFile, setFile],
    );

    const clearError = useCallback(() => setError(null), []);

    return { error, isProcessing, processFile, clearError };
}
