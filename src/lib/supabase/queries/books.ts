import { createAdminClient } from '../admin';
import type { Book, BookInsert } from '@/types/database';

export async function getUserBooks(userId: string): Promise<Book[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

export async function createBook(data: BookInsert): Promise<Book> {
    const supabase = createAdminClient();
    const { data: created, error } = await supabase
        .from('books')
        .insert(data)
        .select('*')
        .single();

    if (error || !created) {
        throw new Error(error?.message ?? 'Failed to create book.');
    }

    return created;
}

export async function updateBookPages(
    bookId: string,
    totalPages: number,
): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('books')
        .update({ total_pages: totalPages })
        .eq('id', bookId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function updateLastOpened(bookId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('books')
        .update({ last_opened: new Date().toISOString() })
        .eq('id', bookId);

    if (error) {
        throw new Error(error.message);
    }
}

export async function deleteBook(userId: string, bookId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }
}
