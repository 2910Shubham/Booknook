import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const primaryEmail =
        user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId,
        )?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
    const name =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.username ||
        primaryEmail ||
        'User';
    const avatarUrl = user.imageUrl ?? null;

    const supabase = createAdminClient();
    const { error } = await supabase.from('profiles').upsert(
        {
            id: userId,
            email: primaryEmail,
            name,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
