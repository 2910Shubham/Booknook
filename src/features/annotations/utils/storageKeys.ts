export function sanitizeBookIdentifier(fileName: string) {
    const base = fileName.replace(/\.pdf$/i, '');
    const sanitized = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .replace(/-+/g, '-');
    return sanitized || 'untitled-book';
}

export function getAnnotationStorageKey(fileName: string) {
    const identifier = sanitizeBookIdentifier(fileName || '');
    return `booknook_annotations_${identifier}`;
}
