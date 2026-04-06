import { useEffect, useMemo, useRef } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { enqueue, hasPendingAnnotation } from '@/lib/offlineQueue';
import { useSyncStore } from '@/store/syncStore';
import { isLocalBookId } from '@/lib/localLibrary';
import { useAnnotationStore } from '../store/annotationStore';
import type { Annotation, AnnotationColor, AnnotationsByPage } from '../types';
import { ANNOTATION_COLORS } from '../types';
import { getAnnotationStorageKey } from '../utils/storageKeys';

const DEFAULT_COLOR: AnnotationColor = ANNOTATION_COLORS[0];

type DbAnnotation = {
    id: string;
    page_number: number;
    tool: string;
    color: string | null;
    data: Record<string, unknown> | null;
    created_at?: string | null;
};

const toLocalAnnotation = (row: DbAnnotation): Annotation | null => {
    const tool = row.tool as Annotation['tool'];
    if (!['highlight', 'pen', 'underline', 'note'].includes(tool)) return null;

    const color = (row.color as AnnotationColor) || DEFAULT_COLOR;
    const createdAt = row.created_at ? Date.parse(row.created_at) : Date.now();
    const data = row.data ?? {};
    const page = row.page_number;

    switch (tool) {
        case 'highlight': {
            return {
                id: row.id,
                tool,
                page,
                color,
                createdAt,
                x: Number(data.x) || 0,
                y: Number(data.y) || 0,
                width: Number(data.width) || 0,
                height: Number(data.height) || 0,
            };
        }
        case 'underline': {
            return {
                id: row.id,
                tool,
                page,
                color,
                createdAt,
                x: Number(data.x) || 0,
                y: Number(data.y) || 0,
                width: Number(data.width) || 0,
            };
        }
        case 'pen': {
            const points = Array.isArray(data.points) ? data.points : [];
            const width =
                typeof data.strokeWidth === 'number'
                    ? data.strokeWidth
                    : typeof data.width === 'number'
                      ? data.width
                      : 2;

            return {
                id: row.id,
                tool,
                page,
                color,
                createdAt,
                points: points as { x: number; y: number }[],
                width,
            };
        }
        case 'note': {
            return {
                id: row.id,
                tool,
                page,
                color,
                createdAt,
                x: Number(data.x) || 0,
                y: Number(data.y) || 0,
                text: typeof data.text === 'string' ? data.text : '',
            };
        }
        default:
            return null;
    }
};

const toDbPayload = (annotation: Annotation, bookId: string) => {
    switch (annotation.tool) {
        case 'highlight':
            return {
                id: annotation.id,
                bookId,
                page: annotation.page,
                tool: annotation.tool,
                color: annotation.color,
                data: {
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                    height: annotation.height,
                },
            };
        case 'underline':
            return {
                id: annotation.id,
                bookId,
                page: annotation.page,
                tool: annotation.tool,
                color: annotation.color,
                data: {
                    x: annotation.x,
                    y: annotation.y,
                    width: annotation.width,
                },
            };
        case 'pen':
            return {
                id: annotation.id,
                bookId,
                page: annotation.page,
                tool: annotation.tool,
                color: annotation.color,
                data: {
                    points: annotation.points,
                    strokeWidth: annotation.width,
                },
            };
        case 'note':
            return {
                id: annotation.id,
                bookId,
                page: annotation.page,
                tool: annotation.tool,
                color: annotation.color,
                data: {
                    x: annotation.x,
                    y: annotation.y,
                    text: annotation.text,
                },
            };
        default:
            return null;
    }
};

const buildSignature = (annotation: Annotation) => {
    switch (annotation.tool) {
        case 'highlight':
            return JSON.stringify({
                tool: annotation.tool,
                page: annotation.page,
                color: annotation.color,
                x: annotation.x,
                y: annotation.y,
                width: annotation.width,
                height: annotation.height,
            });
        case 'underline':
            return JSON.stringify({
                tool: annotation.tool,
                page: annotation.page,
                color: annotation.color,
                x: annotation.x,
                y: annotation.y,
                width: annotation.width,
            });
        case 'pen':
            return JSON.stringify({
                tool: annotation.tool,
                page: annotation.page,
                color: annotation.color,
                width: annotation.width,
                points: annotation.points,
            });
        case 'note':
            return JSON.stringify({
                tool: annotation.tool,
                page: annotation.page,
                color: annotation.color,
                x: annotation.x,
                y: annotation.y,
                text: annotation.text,
            });
        default:
            return JSON.stringify(annotation);
    }
};

const mergeAnnotations = (local: Annotation[], remote: Annotation[]) => {
    const localMap = new Map(local.map((item) => [item.id, item]));
    const remoteMap = new Map(remote.map((item) => [item.id, item]));

    const merged: Annotation[] = remote.map((remoteItem) => {
        const localItem = localMap.get(remoteItem.id);
        if (localItem && hasPendingAnnotation(remoteItem.id)) {
            return localItem;
        }
        return remoteItem;
    });

    local.forEach((localItem) => {
        if (!remoteMap.has(localItem.id)) {
            merged.push(localItem);
        }
    });

    return merged.sort((a, b) => a.createdAt - b.createdAt);
};

export function useAnnotationPersistence(
    fileName: string,
    page: number,
    bookId?: string | null,
) {
    const loadPageAnnotations = useAnnotationStore((s) => s.loadPageAnnotations);
    const clearAllAnnotations = useAnnotationStore((s) => s.clearAllAnnotations);
    const pageAnnotations = useAnnotationStore(
        (s) => s.annotations[`page_${page}`] || [],
    );
    const beginSync = useSyncStore((s) => s.begin);
    const endSync = useSyncStore((s) => s.end);

    const storageKey = useMemo(
        () => (fileName ? getAnnotationStorageKey(fileName) : ''),
        [fileName],
    );

    const remoteBookId = useMemo(
        () => (bookId && !isLocalBookId(bookId) ? bookId : null),
        [bookId],
    );

    const skipSyncRef = useRef(true);
    const prevRef = useRef<Annotation[]>([]);

    useEffect(() => {
        if (!storageKey) return;
        clearAllAnnotations();
    }, [storageKey, clearAllAnnotations]);

    useEffect(() => {
        if (!storageKey) return;
        const stored = getStorageItem<AnnotationsByPage>(storageKey, {});
        const pageKey = `page_${page}`;
        const localPage = stored[pageKey] || [];
        skipSyncRef.current = true;
        loadPageAnnotations(page, localPage as Annotation[]);
    }, [storageKey, page, loadPageAnnotations]);

    useEffect(() => {
        if (!storageKey || !remoteBookId) return;
        let cancelled = false;

        const fetchRemote = async () => {
            try {
                const response = await fetch(
                    `/api/annotations?bookId=${remoteBookId}&page=${page}`,
                    { credentials: 'include' },
                );
                if (!response.ok) return;
                const contentType = response.headers.get('content-type') ?? '';
                if (!contentType.includes('application/json')) return;
                const payload = await response.json();
                const rows = Array.isArray(payload?.annotations)
                    ? (payload.annotations as DbAnnotation[])
                    : [];
                const remote = rows
                    .map((row) => toLocalAnnotation(row))
                    .filter(Boolean) as Annotation[];

                const stored = getStorageItem<AnnotationsByPage>(storageKey, {});
                const pageKey = `page_${page}`;
                const localPage = (stored[pageKey] || []) as Annotation[];
                const merged = mergeAnnotations(localPage, remote);

                if (cancelled) return;
                skipSyncRef.current = true;
                loadPageAnnotations(page, merged);

                const cleaned: AnnotationsByPage = {};
                Object.entries({ ...stored, [pageKey]: merged }).forEach(
                    ([key, items]) => {
                        if (items && items.length > 0) {
                            cleaned[key] = items;
                        }
                    },
                );
                setStorageItem(storageKey, cleaned);
            } catch {
                // ignore
            }
        };

        void fetchRemote();
        return () => {
            cancelled = true;
        };
    }, [storageKey, remoteBookId, page, loadPageAnnotations]);

    useEffect(() => {
        if (!storageKey) return;
        if (skipSyncRef.current) {
            skipSyncRef.current = false;
            prevRef.current = pageAnnotations;
            return;
        }

        const previous = prevRef.current;
        prevRef.current = pageAnnotations;

        if (!remoteBookId) return;

        const prevMap = new Map(previous.map((item) => [item.id, item]));
        const nextMap = new Map(pageAnnotations.map((item) => [item.id, item]));

        const added = pageAnnotations.filter((item) => !prevMap.has(item.id));
        const removed = previous.filter((item) => !nextMap.has(item.id));
        const updated = pageAnnotations.filter((item) => {
            const prior = prevMap.get(item.id);
            return prior ? buildSignature(prior) !== buildSignature(item) : false;
        });

        const createRemote = async (annotation: Annotation) => {
            const payload = toDbPayload(annotation, remoteBookId);
            if (!payload) return;
            beginSync();
            try {
                const response = await fetch('/api/annotations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    enqueue({
                        id: `create-${annotation.id}`,
                        type: 'create_annotation',
                        payload,
                        createdAt: Date.now(),
                    });
                }
            } catch {
                enqueue({
                    id: `create-${annotation.id}`,
                    type: 'create_annotation',
                    payload,
                    createdAt: Date.now(),
                });
            } finally {
                endSync();
            }
        };

        const updateRemote = async (annotation: Annotation) => {
            const payload = toDbPayload(annotation, remoteBookId);
            if (!payload) return;
            beginSync();
            try {
                const response = await fetch(`/api/annotations/${annotation.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: annotation.id,
                        data: payload.data,
                        color: payload.color,
                    }),
                });
                if (!response.ok) {
                    enqueue({
                        id: `update-${annotation.id}`,
                        type: 'update_annotation',
                        payload: {
                            id: annotation.id,
                            data: payload.data,
                            color: payload.color,
                        },
                        createdAt: Date.now(),
                    });
                }
            } catch {
                enqueue({
                    id: `update-${annotation.id}`,
                    type: 'update_annotation',
                    payload: {
                        id: annotation.id,
                        data: payload.data,
                        color: payload.color,
                    },
                    createdAt: Date.now(),
                });
            } finally {
                endSync();
            }
        };

        const deleteRemote = async (annotation: Annotation) => {
            beginSync();
            try {
                const response = await fetch(`/api/annotations/${annotation.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!response.ok) {
                    enqueue({
                        id: `delete-${annotation.id}`,
                        type: 'delete_annotation',
                        payload: { id: annotation.id },
                        createdAt: Date.now(),
                    });
                }
            } catch {
                enqueue({
                    id: `delete-${annotation.id}`,
                    type: 'delete_annotation',
                    payload: { id: annotation.id },
                    createdAt: Date.now(),
                });
            } finally {
                endSync();
            }
        };

        added.forEach((annotation) => {
            void createRemote(annotation);
        });
        updated.forEach((annotation) => {
            void updateRemote(annotation);
        });
        removed.forEach((annotation) => {
            void deleteRemote(annotation);
        });
    }, [pageAnnotations, storageKey, remoteBookId, beginSync, endSync]);

    useEffect(() => {
        if (!storageKey) return;
        const unsubscribe = useAnnotationStore.subscribe(
            (state) => state.annotations,
            (annotations) => {
                const payload: AnnotationsByPage = {};
                Object.entries(annotations).forEach(([pageKey, items]) => {
                    if (items && items.length > 0) {
                        payload[pageKey] = items;
                    }
                });
                setStorageItem(storageKey, payload);
            },
        );

        return () => unsubscribe();
    }, [storageKey]);
}




