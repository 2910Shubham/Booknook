'use client';

import React, { useEffect, useState } from 'react';
import { useProgressStore } from '@/store/progressStore';
import { X } from 'lucide-react';

export default function Toast() {
    const toasts = useProgressStore((s) => s.toasts);
    const removeToast = useProgressStore((s) => s.removeToast);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    text={toast.text}
                    type={toast.type}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
}

function ToastItem({
    id,
    text,
    type,
    onDismiss,
}: {
    id: string;
    text: string;
    type: string;
    onDismiss: (id: string) => void;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(id), 300);
    };

    return (
        <div
            className={`toast-item toast-${type} ${visible ? 'toast-visible' : 'toast-hidden'}`}
            role="alert"
        >
            <span className="toast-text">{text}</span>
            <button
                onClick={handleDismiss}
                className="toast-close"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}
