import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const annotationId = params.id;
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', annotationId)
        .eq('user_id', userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } },
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const annotationId = params.id;
    const body = await request.json();
    const data = typeof body.data === 'object' && body.data ? body.data : null;
    const color = typeof body.color === 'string' ? body.color : null;

    if (!data) {
        return NextResponse.json({ error: 'Missing data.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: updated, error } = await supabase
        .from('annotations')
        .update({
            data,
            color,
            updated_at: new Date().toISOString(),
        })
        .eq('id', annotationId)
        .eq('user_id', userId)
        .select('*')
        .single();

    if (error || !updated) {
        return NextResponse.json(
            { error: error?.message ?? 'Failed to update annotation.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ annotation: updated });
}
