import { createAdminClient } from '../admin';
import type { ReadingSession } from '@/types/database';

export async function logSession(
    userId: string,
    bookId: string,
    duration: number,
    pagesRead: number,
): Promise<void> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: existing, error: fetchError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('date', today)
        .maybeSingle();

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    if (existing) {
        const { error } = await supabase
            .from('reading_sessions')
            .update({
                duration: existing.duration + duration,
                pages_read: existing.pages_read + pagesRead,
            })
            .eq('id', existing.id);

        if (error) {
            throw new Error(error.message);
        }
        return;
    }

    const { error } = await supabase.from('reading_sessions').insert({
        user_id: userId,
        book_id: bookId,
        date: today,
        duration,
        pages_read: pagesRead,
    });

    if (error) {
        throw new Error(error.message);
    }
}
