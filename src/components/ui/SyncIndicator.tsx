'use client';

import React from 'react';
import { useSyncStore } from '@/store/syncStore';

export default function SyncIndicator() {
    const inFlight = useSyncStore((s) => s.inFlight);
    const pendingCount = useSyncStore((s) => s.pendingCount);
    const isOffline = useSyncStore((s) => s.isOffline);

    const status = isOffline
        ? 'offline'
        : inFlight > 0 || pendingCount > 0
          ? 'saving'
          : 'saved';
    const statusLabel =
        status === 'offline' ? 'Offline' : status === 'saving' ? 'Saving...' : 'Saved';

    const handleClick = () => {
        if (status === 'offline' || pendingCount > 0) {
            const message = `Pending sync operations: ${pendingCount}`;
            window.alert(message);
        }
    };

    return (
        <button
            type="button"
            className={`sync-indicator sync-${status}`}
            onClick={handleClick}
            aria-label={`Sync status: ${statusLabel}`}
        >
            <span className="sync-dot" />
            <span className="sync-label">{statusLabel}</span>
        </button>
    );
}
