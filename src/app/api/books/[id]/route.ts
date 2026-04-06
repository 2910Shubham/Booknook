import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

const sanitizePath = (path: string | null) =>
    typeof path === 'string' && path.length > 0 ? path : null;

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = params.id;
    const supabase = createAdminClient();

    const { data: book, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .maybeSingle();

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!book) {
        return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }

    if (book.user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filePath = sanitizePath(book.file_path);
    if (filePath) {
        await supabase.storage.from('books').remove([filePath]);
    }

    const { error: deleteError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', userId);

    if (deleteError) {
        return NextResponse.json(
            { error: deleteError.message },
            { status: 500 },
        );
    }

    return NextResponse.json({ success: true });
}

export async function GET(
    _request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = params.id;
    const supabase = createAdminClient();
    const { data: book, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!book) {
        return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }

    if (book.user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ book });
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = params.id;
    const body = await request.json();
    const filePath = typeof body.filePath === 'string' ? body.filePath : null;
    const totalPages =
        typeof body.totalPages === 'number' && Number.isFinite(body.totalPages)
            ? body.totalPages
            : null;

    const lastOpened = body.lastOpened === true;
    const supabase = createAdminClient();
    const { data: book, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .maybeSingle();

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!book) {
        return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }

    if (book.user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (filePath) updates.file_path = filePath;
    if (totalPages !== null) updates.total_pages = totalPages;
    if (lastOpened) updates.last_opened = new Date().toISOString();

    const { data: updated, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', bookId)
        .eq('user_id', userId)
        .select('*')
        .single();

    if (error || !updated) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to update book.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ book: updated });
}
