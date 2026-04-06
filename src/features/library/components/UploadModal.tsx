'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { loadPdfDocument } from '@/lib/pdf';
import {
    COMPRESSION_THRESHOLD_BYTES,
    COMPRESSION_THRESHOLD_MB,
    ACCEPTED_FILE_TYPES,
    ACCEPTED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
} from '@/lib/constants';
import { compressPdfFile } from '@/lib/pdfCompression';
import { usePdfStore } from '@/store/pdfStore';
import { useProgressStore } from '@/store/progressStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useUploadStore } from '@/store/uploadStore';
import {
    createLocalBookMeta,
    deleteLocalFile,
    removeLocalBook,
    saveLocalFile,
    upsertLocalBook,
} from '@/lib/localLibrary';

type Stage = 'select' | 'uploading' | 'complete';

interface UploadModalProps {
    open: boolean;
    onClose: () => void;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const sanitizeTitle = (name: string) =>
    name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}.`));
            }
        };
        xhr.onerror = () => reject(new Error('Upload failed.'));
        xhr.send(file);
    });

export default function UploadModal({ open, onClose }: UploadModalProps) {
    const addBook = useLibraryStore((s) => s.addBook);
    const removeBook = useLibraryStore((s) => s.removeBook);
    const setPdfFile = usePdfStore((s) => s.setFile);
    const addToast = useProgressStore((s) => s.addToast);
    const startUpload = useUploadStore((s) => s.startUpload);
    const setUploadProgress = useUploadStore((s) => s.setProgress);
    const markUploadSuccess = useUploadStore((s) => s.succeed);
    const markUploadFailed = useUploadStore((s) => s.fail);
    const router = useRouter();
    const [stage, setStage] = useState<Stage>('select');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [file, setSelectedFile] = useState<File | null>(null);
    const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(
        null,
    );
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!open) {
            setStage('select');
            setProgress(0);
            setError(null);
            setSelectedFile(null);
            setFileMeta(null);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!open) return null;

    const startBackgroundUpload = async (
        selected: File,
        totalPages: number,
        title: string,
        localId: string,
    ) => {
        try {
            startUpload(selected.name);
            const createRes = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    fileSize: selected.size,
                    totalPages,
                }),
            });

            if (!createRes.ok) {
                const message =
                    createRes.status === 401
                        ? 'Session expired. Please sign in again.'
                        : 'Upload failed to start. Please try again.';
                markUploadFailed(`${message} (saved locally)`);
                addToast(message, 'error');
            }
            const createType = createRes.headers.get('content-type') ?? '';
            if (!createType.includes('application/json')) {
                const message = 'Upload failed to start. Please try again.';
                markUploadFailed(`${message} (saved locally)`);
                addToast(message, 'error');
                return;
            }

            const created = await createRes.json();
            const book = created.book;

            const uploadUrlRes = await fetch(`/api/books/${book.id}/upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fileName: selected.name }),
            });

            if (!uploadUrlRes.ok) {
                const message =
                    uploadUrlRes.status === 401
                        ? 'Session expired. Please sign in again.'
                        : 'Upload failed to start. Please try again.';
                markUploadFailed(`${message} (saved locally)`);
                addToast(message, 'error');
                return;
            }
            const uploadType = uploadUrlRes.headers.get('content-type') ?? '';
            if (!uploadType.includes('application/json')) {
                const message = 'Upload failed to start. Please try again.';
                markUploadFailed(`${message} (saved locally)`);
                addToast(message, 'error');
                return;
            }

            const uploadUrl = await uploadUrlRes.json();
            await uploadWithProgress(uploadUrl.signedUrl, selected, setUploadProgress);

            const patchRes = await fetch(`/api/books/${book.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    filePath: uploadUrl.path,
                    totalPages,
                }),
            });

            if (patchRes.ok) {
                const patchType = patchRes.headers.get('content-type') ?? '';
                if (!patchType.includes('application/json')) {
                    const message = 'Upload finished but could not update library.';
                    markUploadFailed(`${message} (saved locally)`);
                    addToast(message, 'error');
                    return;
                }
                const patched = await patchRes.json();
                addBook({ ...patched.book, progress: null });
                removeBook(localId);
                removeLocalBook(localId);
                await deleteLocalFile(localId);
                markUploadSuccess();
                addToast('Upload complete. Book added to your library.', 'success');
            } else {
                const message = 'Upload finished but could not update library.';
                markUploadFailed(`${message} (saved locally)`);
                addToast(message, 'error');
            }
        } catch (err) {
            const message = 'Upload failed. Please try again.';
            markUploadFailed(`${message} (saved locally)`);
            addToast(message, 'error');
        }
    };

    const handleFile = async (selected: File) => {
        setError(null);
        const isPdf =
            ACCEPTED_MIME_TYPES.includes(selected.type) ||
            selected.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            setError('Please upload a PDF file.');
            return;
        }

    const handleFile = async (selected: File) => {
        setError(null);
        const isPdf =
            ACCEPTED_MIME_TYPES.includes(selected.type) ||
            selected.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            setError('Please upload a PDF file.');
                addToast(
                    `Compressing PDF (>${COMPRESSION_THRESHOLD_MB}MB)...`,
                    'info',
                );
                try {
                    const compressed = await compressPdfFile(selected);
                    workingFile = compressed;
                    if (compressed.size < selected.size) {
                        addToast(
            let workingFile = selected;
            if (selected.size > COMPRESSION_THRESHOLD_BYTES) {
                        );
                    } else {
                        addToast(
                            'Compression complete (no size reduction).',
                            'info',
                        );
                    }
                } catch {
                    addToast(
                        'Compression failed; uploading original file.',
                        'error',
                    );
                }
            }

            const buffer = await workingFile.arrayBuffer();
            const doc = await loadPdfDocument(buffer);
            const totalPages = doc.numPages || 0;
            const title = sanitizeTitle(workingFile.name);
            const localBook = createLocalBookMeta(workingFile, totalPages, title);

                        'error',
                    );
                }
            }

            addBook({
            const doc = await loadPdfDocument(buffer);
            const totalPages = doc.numPages || 0;
                progress: null,
            const localBook = createLocalBookMeta(workingFile, totalPages, title);

            setPdfFile(buffer, workingFile.name, workingFile.size);
            addToast('Opening your book. Uploading in background...', 'info');
            onClose();
            router.push(`/reader?bookId=${localBook.id}`);

                file_path: null,
                progress: null,
            });

            setPdfFile(buffer, workingFile.name, workingFile.size);
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Upload failed.';
            setError(message);
            setStage('select');
                totalPages,
                title,
    };
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const dropped = event.dataTransfer.files?.[0];
        if (dropped) {
            handleFile(dropped);
        }
    };

    return (
        <div className="upload-modal-backdrop" onClick={onClose}>
            <div
                className="upload-modal"
                onClick={(event) => event.stopPropagation()}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
            >
                {stage === 'select' && (
                    <>
                        <div className="upload-modal-title">Upload a PDF</div>
                        <div className="upload-dropzone">
                            <p>Drop your PDF here</p>
                            <span>or click to browse</span>
                            <input
                                type="file"
                                accept={ACCEPTED_FILE_TYPES}
                                onChange={(event) => {
                                    const selected = event.target.files?.[0];
                                    if (selected) handleFile(selected);
                                }}
                            />
                        </div>
                        {error && <div className="upload-error">{error}</div>}
                        <div className="upload-modal-actions">
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </>
                )}

                {stage === 'uploading' && (
                    <div className="upload-progress">
                        <Spinner size={28} />
                        <div className="upload-progress-info">
                            <div className="upload-progress-name">
                                {fileMeta?.name}
                            </div>
                            <div className="upload-progress-size">
                                {fileMeta ? formatSize(fileMeta.size) : ''}
                            </div>
                        </div>
                        <div className="upload-progress-bar">
                            <div
                                className="upload-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="upload-progress-text">
                            Uploading... {progress}%
                        </div>
                    </div>
                )}

                {stage === 'complete' && (
                    <div className="upload-complete">
                        <div className="upload-check">✓</div>
                        <div className="upload-complete-title">Ready to read!</div>
                        <div className="upload-complete-text">
                            Your book is now in your library.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
          )}
            </div>
        </div>
    );
}
