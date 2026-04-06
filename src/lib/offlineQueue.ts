import { useSyncStore } from '@/store/syncStore';

export type QueuedOperationType =
    | 'create_annotation'
    | 'update_annotation'
    | 'delete_annotation'
    | 'update_progress'
    | 'log_session';

export interface QueuedOperation {
    id: string;
    type: QueuedOperationType;
    payload: Record<string, unknown>;
    createdAt: number;
    attempts: number;
}

const QUEUE_KEY = 'booknook_offline_queue';
const MAX_ATTEMPTS = 5;

const readQueue = (): QueuedOperation[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as QueuedOperation[]) : [];
    } catch {
        return [];
    }
};

const writeQueue = (queue: QueuedOperation[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    useSyncStore.getState().setPending(queue.length);
};

export const getPendingCount = () => readQueue().length;

export const hasPendingAnnotation = (id: string) => {
    const queue = readQueue();
    return queue.some((item) => {
        if (
            item.type !== 'create_annotation' &&
            item.type !== 'update_annotation' &&
            item.type !== 'delete_annotation'
        ) {
            return false;
        }
        const payloadId = item.payload?.id;
        return typeof payloadId === 'string' && payloadId === id;
    });
};

export const enqueue = (operation: Omit<QueuedOperation, 'attempts'>) => {
    const queue = readQueue();
    queue.push({ ...operation, attempts: 0 });
    writeQueue(queue);
};

const executeOperation = async (operation: QueuedOperation) => {
    switch (operation.type) {
        case 'create_annotation':
            return fetch('/api/annotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(operation.payload),
            });
        case 'update_annotation':
            return fetch(`/api/annotations/${operation.payload.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(operation.payload),
            });
        case 'delete_annotation':
            return fetch(`/api/annotations/${operation.payload.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
        case 'update_progress':
            return fetch('/api/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(operation.payload),
            });
        case 'log_session':
            return fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(operation.payload),
            });
        default:
            return null;
    }
};

export const processQueue = async () => {
    if (typeof window === 'undefined') return;
    if (!navigator.onLine) {
        useSyncStore.getState().setOffline(true);
        return;
    }

    useSyncStore.getState().setOffline(false);
    const queue = readQueue();
    if (queue.length === 0) {
        useSyncStore.getState().setPending(0);
        return;
    }

    useSyncStore.getState().begin();
    const remaining: QueuedOperation[] = [];

    for (const item of queue) {
        try {
            const response = await executeOperation(item);
            if (response && response.ok) {
                continue;
            }
            const next = { ...item, attempts: item.attempts + 1 };
            if (next.attempts < MAX_ATTEMPTS) {
                remaining.push(next);
            }
        } catch {
            const next = { ...item, attempts: item.attempts + 1 };
            if (next.attempts < MAX_ATTEMPTS) {
                remaining.push(next);
            }
        }
    }

    writeQueue(remaining);
    useSyncStore.getState().end();
};
