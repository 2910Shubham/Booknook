import { createAdminClient } from '../admin';
import type { Bookmark } from '@/types/database';

export async function getBookmarks(
    userId: string,
    bookId: string,
): Promise<Bookmark[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

export async function addBookmark(
    userId: string,
    bookId: string,
    page: number,
    label = '',
): Promise<Bookmark> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('bookmarks')
        .insert({
            user_id: userId,
            book_id: bookId,
            page_number: page,
            label,
        })
        .select('*')
        .single();

    if (error || !data) {
        throw new Error(error?.message ?? 'Failed to add bookmark.');
    }

    return data;
}

export async function removeBookmark(
    userId: string,
    bookId: string,
    page: number,
): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('page_number', page);

    if (error) {
        throw new Error(error.message);
    }
}
