import { createAdminClient } from '../admin';
import type { Annotation } from '@/types/database';

type NewAnnotation = Omit<Annotation, 'id' | 'created_at' | 'updated_at'>;

export async function getPageAnnotations(
    bookId: string,
    page: number,
): Promise<Annotation[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('book_id', bookId)
        .eq('page_number', page)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data ?? [];
}

export async function createAnnotation(data: NewAnnotation): Promise<Annotation> {
    const supabase = createAdminClient();
    const { data: created, error } = await supabase
        .from('annotations')
        .insert(data)
        .select('*')
        .single();

    if (error || !created) {
        throw new Error(error?.message ?? 'Failed to create annotation.');
    }

    return created;
}

export async function deleteAnnotation(annotationId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', annotationId);

    if (error) {
        throw new Error(error.message);
    }
}
