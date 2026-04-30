'use server';

import { createAdminClient, TEST_USER_ID } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function uploadAssetAction(
  pressKitId: string,
  type: 'header' | 'logo' | 'screenshot' | 'trailer',
  file: { name: string; data: string; mime: string }
) {
  const supabase = createAdminClient();
  const buffer = Buffer.from(file.data, 'base64');
  const path = `${pressKitId}/${type}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const { error: uploadErr } = await supabase.storage
    .from('press-kit-assets')
    .upload(path, buffer, { contentType: file.mime, upsert: false });

  if (uploadErr) return { error: uploadErr.message };

  const { data: urlData } = supabase.storage
    .from('press-kit-assets')
    .getPublicUrl(path);

  const { error: insertErr } = await supabase
    .from('press_kit_assets')
    .insert({
      press_kit_id: pressKitId,
      type,
      url: urlData.publicUrl,
      filename: file.name,
      mime_type: file.mime,
      size_bytes: buffer.length,
    });

  if (insertErr) return { error: insertErr.message };

  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true, url: urlData.publicUrl };
}

export async function deleteAssetAction(assetId: string, pressKitId: string) {
  const supabase = createAdminClient();
  await supabase.from('press_kit_assets').delete().eq('id', assetId);
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function addLinkAction(pressKitId: string, title: string, url: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kit_links')
    .insert({ press_kit_id: pressKitId, title, url });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function addContactAction(pressKitId: string, name: string, email: string, role: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kit_contacts')
    .insert({ press_kit_id: pressKitId, name, email, role });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function updatePressKitAction(
  pressKitId: string,
  updates: {
    game_name?: string;
    tagline?: string;
    description?: string;
    release_date?: string;
    platforms?: string[];
    website_url?: string;
  }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kits')
    .update(updates)
    .eq('id', pressKitId);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}
