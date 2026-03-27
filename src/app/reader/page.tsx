'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePdfStore } from '@/store/pdfStore';
import ReaderLayout from '@/features/reader/components/ReaderLayout';

export default function ReaderPage() {
    const router = useRouter();
    const file = usePdfStore((s) => s.file);
    const clearFile = usePdfStore((s) => s.clearFile);

    // If no file is loaded, redirect to home
    useEffect(() => {
        if (!file) {
            router.replace('/');
        }
    }, [file, router]);

    const handleClose = () => {
        clearFile();
        router.push('/');
    };

    if (!file) return null;

    return <ReaderLayout onClose={handleClose} />;
}
