import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    if (!bookId) {
        return NextResponse.json({ error: 'Missing bookId.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data ?? null });
}

export async function PUT(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bookId = typeof body.bookId === 'string' ? body.bookId : null;
    const currentPage =
        typeof body.currentPage === 'number' ? body.currentPage : null;
    const totalPages =
        typeof body.totalPages === 'number' ? body.totalPages : null;
    const totalTime =
        typeof body.totalTime === 'number' ? body.totalTime : undefined;

    if (!bookId || currentPage === null) {
        return NextResponse.json(
            { error: 'Missing bookId or currentPage.' },
            { status: 400 },
        );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('reading_progress').upsert(
        {
            user_id: userId,
            book_id: bookId,
            current_page: currentPage,
            total_pages: totalPages ?? 0,
            total_time_read: totalTime ?? 0,
            last_read_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,book_id' },
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
