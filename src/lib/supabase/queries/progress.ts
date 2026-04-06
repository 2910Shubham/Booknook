import { createAdminClient } from '../admin';
import type { ReadingProgress } from '@/types/database';

export async function getProgress(
    userId: string,
    bookId: string,
): Promise<ReadingProgress | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data ?? null;
}

export async function upsertProgress(
    userId: string,
    bookId: string,
    page: number,
    totalTime: number,
): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('reading_progress').upsert(
        {
            user_id: userId,
            book_id: bookId,
            current_page: page,
            total_time_read: totalTime,
            last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' },
    );

    if (error) {
        throw new Error(error.message);
    }
}
