import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bookId = typeof body.bookId === 'string' ? body.bookId : null;
    const duration = typeof body.duration === 'number' ? body.duration : null;
    const pagesRead = typeof body.pagesRead === 'number' ? body.pagesRead : null;

    if (!bookId || duration === null || pagesRead === null) {
        return NextResponse.json(
            { error: 'Missing session data.' },
            { status: 400 },
        );
    }

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
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
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
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('reading_sessions').insert({
        user_id: userId,
        book_id: bookId,
        date: today,
        duration,
        pages_read: pagesRead,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
