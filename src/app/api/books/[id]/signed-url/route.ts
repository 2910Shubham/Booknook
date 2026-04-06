import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    if (!book.file_path) {
        return NextResponse.json(
            { error: 'Book file is missing.' },
            { status: 400 },
        );
    }

    const { data, error } = await supabase.storage
        .from('books')
        .createSignedUrl(book.file_path, 7200);

    if (error || !data?.signedUrl) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to create signed URL.' },
            { status: 500 },
        );
    }

    return NextResponse.json({
        url: data.signedUrl,
        expiresAt: Date.now() + 7200 * 1000,
    });
}
