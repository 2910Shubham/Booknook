'use client';

import { createClient } from './client';

const BUCKET = 'books';
const SIGNED_URL_EXPIRES_IN = 7200;

const sanitizeFileName = (name: string) =>
    name.trim().replace(/[^a-zA-Z0-9._-]/g, '-');

export async function uploadBookFile(
    userId: string,
    bookId: string,
    file: File,
): Promise<string> {
    const supabase = createClient();
    const safeName = sanitizeFileName(file.name);
    const path = `${userId}/${bookId}/${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
    });

    if (error) {
        throw new Error(error.message);
    }

    return path;
}

export async function getSignedUrl(filePath: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

    if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? 'Failed to create signed URL.');
    }

    return data.signedUrl;
}

export async function deleteBookFile(filePath: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

    if (error) {
        throw new Error(error.message);
    }
}
