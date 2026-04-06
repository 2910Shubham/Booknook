import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

const sanitizeFileName = (name: string) =>
    name.trim().replace(/[^a-zA-Z0-9._-]/g, '-');

export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const fileName =
        typeof body.fileName === 'string' ? body.fileName.trim() : '';

    if (!fileName) {
        return NextResponse.json(
            { error: 'Missing file name.' },
            { status: 400 },
        );
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

    const safeName = sanitizeFileName(fileName);
    const path = `${userId}/${bookId}/${safeName}`;

    const { data, error } = await supabase.storage
        .from('books')
        .createSignedUploadUrl(path, { upsert: true });

    if (error || !data?.signedUrl) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to create upload URL.' },
            { status: 500 },
        );
    }

    return NextResponse.json({
        signedUrl: data.signedUrl,
        path,
    });
}
