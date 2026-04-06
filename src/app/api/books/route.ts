import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('books')
        .select('*, reading_progress(*)')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const books = (data ?? []).map((book) => {
        const progress = Array.isArray(book.reading_progress)
            ? book.reading_progress[0] ?? null
            : null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { reading_progress, ...rest } = book;
        return { ...rest, progress };
    });

    return NextResponse.json({ books });
}

export async function POST(request: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
    const fileSize =
        typeof body.fileSize === 'number' && Number.isFinite(body.fileSize)
            ? body.fileSize
            : null;
    const totalPages =
        typeof body.totalPages === 'number' && Number.isFinite(body.totalPages)
            ? body.totalPages
            : 0;

    if (!title || !fileName) {
        return NextResponse.json(
            { error: 'Missing title or file name.' },
            { status: 400 },
        );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('books')
        .insert({
            user_id: userId,
            title,
            file_name: fileName,
            file_size: fileSize,
            total_pages: totalPages,
        })
        .select('*')
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to create book.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ book: data }, { status: 201 });
}
