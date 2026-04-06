'use client';

import { useEffect } from 'react';
import { processQueue, getPendingCount } from '@/lib/offlineQueue';
import { useSyncStore } from '@/store/syncStore';

export default function SyncManager() {
    const setPending = useSyncStore((s) => s.setPending);
    const setOffline = useSyncStore((s) => s.setOffline);

    useEffect(() => {
        setPending(getPendingCount());
        setOffline(!navigator.onLine);
        void processQueue();

        const handleOnline = () => {
            setOffline(false);
            void processQueue();
        };

        const handleOffline = () => {
            setOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setPending, setOffline]);

    return null;
}
