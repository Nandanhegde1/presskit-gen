'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function createPressKitAction(formData: {
  gameName: string;
  tagline: string;
  description: string;
  releaseDate: string;
  platforms: string[];
  websiteUrl: string;
}) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated. Please log in.' };

  const supabase = createAdminClient();
  const slug = slugify(formData.gameName, { lower: true, strict: true });

  // Check duplicate
  const { data: existing } = await supabase
    .from('press_kits')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return { error: 'A press kit with this name already exists. Choose a different name.' };
  }

  const { data: pressKit, error: insertError } = await supabase
    .from('press_kits')
    .insert({
      user_id: userId,
      slug,
      game_name: formData.gameName,
      tagline: formData.tagline || null,
      description: formData.description || null,
      release_date: formData.releaseDate || null,
      platforms: formData.platforms,
      website_url: formData.websiteUrl || null,
      template_id: 'default',
      is_published: true,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath('/dashboard');
  return { success: true, pressKitId: pressKit.id, slug: pressKit.slug };
}

export async function deletePressKitAction(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kits')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}
