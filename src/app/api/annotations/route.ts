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
    const page = Number(searchParams.get('page'));

    if (!bookId || !Number.isFinite(page)) {
        return NextResponse.json({ error: 'Missing bookId or page.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('page_number', page)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ annotations: data ?? [] });
}

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const bookId = typeof body.bookId === 'string' ? body.bookId : null;
    const pageNumber = typeof body.page === 'number' ? body.page : null;
    const tool = typeof body.tool === 'string' ? body.tool : null;
    const color = typeof body.color === 'string' ? body.color : null;
    const data = typeof body.data === 'object' && body.data ? body.data : null;
    const id = typeof body.id === 'string' ? body.id : undefined;

    if (!bookId || pageNumber === null || !tool || !data) {
        return NextResponse.json(
            { error: 'Missing annotation fields.' },
            { status: 400 },
        );
    }

    const supabase = createAdminClient();
    const { data: created, error } = await supabase
        .from('annotations')
        .insert({
            id,
            user_id: userId,
            book_id: bookId,
            page_number: pageNumber,
            tool,
            color,
            data,
        })
        .select('*')
        .single();

    if (error || !created) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to create annotation.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ annotation: created }, { status: 201 });
}
