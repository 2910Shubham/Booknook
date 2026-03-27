import { useEffect, useMemo } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { useAnnotationStore } from '../store/annotationStore';
import type { Annotation, AnnotationsByPage } from '../types';
import { getAnnotationStorageKey } from '../utils/storageKeys';

export function useAnnotationPersistence(fileName: string, page: number) {
    const loadPageAnnotations = useAnnotationStore((s) => s.loadPageAnnotations);
    const clearAllAnnotations = useAnnotationStore((s) => s.clearAllAnnotations);

    const storageKey = useMemo(
        () => (fileName ? getAnnotationStorageKey(fileName) : ''),
        [fileName],
    );

    useEffect(() => {
        if (!storageKey) return;
        clearAllAnnotations();
    }, [storageKey, clearAllAnnotations]);

    useEffect(() => {
        if (!storageKey) return;
        const stored = getStorageItem<AnnotationsByPage>(storageKey, {});
        const pageKey = `page_${page}`;
        const pageAnnotations = stored[pageKey] || [];
        loadPageAnnotations(page, pageAnnotations as Annotation[]);
    }, [storageKey, page, loadPageAnnotations]);

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
