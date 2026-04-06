import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export function createServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error('Missing Supabase environment variables.');
    }

    const cookieStore = cookies();

    return createSupabaseServerClient(url, anonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: { [key: string]: unknown }) {
                cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: { [key: string]: unknown }) {
                cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            },
        },
    });
}
