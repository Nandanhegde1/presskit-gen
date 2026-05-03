'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { scrapeUrl, type ScrapedKit } from '@/lib/scrapers';

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
      file_size: buffer.length,
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

export async function addLinkAction(pressKitId: string, label: string, url: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kit_links')
    .insert({ press_kit_id: pressKitId, label, url });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function deleteLinkAction(linkId: string, pressKitId: string) {
  const supabase = createAdminClient();
  await supabase.from('press_kit_links').delete().eq('id', linkId);
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function addContactAction(
  pressKitId: string,
  name: string,
  email: string,
  role: string
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('press_kit_contacts')
    .insert({
      press_kit_id: pressKitId,
      name: name?.trim() || email,
      email: email || null,
      role: role || null,
    });
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

export async function deleteContactAction(contactId: string, pressKitId: string) {
  const supabase = createAdminClient();
  await supabase.from('press_kit_contacts').delete().eq('id', contactId);
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
    template_id?: string;
  }
) {
  const supabase = createAdminClient();
  const sanitized: Record<string, any> = { ...updates };
  if (sanitized.release_date === '') sanitized.release_date = null;
  if (sanitized.tagline === '') sanitized.tagline = null;
  if (sanitized.description === '') sanitized.description = null;
  if (sanitized.website_url === '') sanitized.website_url = null;

  const { error } = await supabase
    .from('press_kits')
    .update(sanitized)
    .eq('id', pressKitId);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true };
}

/**
 * Import a press kit from a Steam or itch.io URL.
 * Fetches structured data, downloads images server-side, stores in Supabase Storage,
 * and only fills in EMPTY fields on the existing press kit (never overwrites user input).
 */
export async function importFromUrlAction(pressKitId: string, url: string) {
  let scraped: ScrapedKit;
  try {
    scraped = await scrapeUrl(url);
  } catch (e: any) {
    return { error: e?.message || 'Failed to fetch the URL.' };
  }

  const supabase = createAdminClient();

  const { data: current, error: loadErr } = await supabase
    .from('press_kits')
    .select('id, game_name, tagline, description, release_date, platforms, website_url')
    .eq('id', pressKitId)
    .single();
  if (loadErr || !current) return { error: 'Press kit not found.' };

  const patch: Record<string, any> = {};
  if (!current.game_name || /untitled/i.test(current.game_name)) patch.game_name = scraped.gameName;
  if (!current.tagline && scraped.tagline) patch.tagline = scraped.tagline;
  if (!current.description && scraped.description) patch.description = scraped.description;
  if (!current.release_date && scraped.releaseDate) patch.release_date = scraped.releaseDate;
  if ((!current.platforms || current.platforms.length === 0) && scraped.platforms.length) {
    patch.platforms = scraped.platforms;
  }
  if (!current.website_url && scraped.websiteUrl) patch.website_url = scraped.websiteUrl;

  if (Object.keys(patch).length > 0) {
    await supabase.from('press_kits').update(patch).eq('id', pressKitId);
  }

  const stats = { header: 0, screenshots: 0, links: 0 };

  if (scraped.headerImageUrl) {
    const ok = await downloadAndStore(supabase, pressKitId, 'header', scraped.headerImageUrl);
    if (ok) stats.header = 1;
  }

  for (const sUrl of scraped.screenshotUrls.slice(0, 12)) {
    const ok = await downloadAndStore(supabase, pressKitId, 'screenshot', sUrl);
    if (ok) stats.screenshots += 1;
  }

  const { data: existingLinks } = await supabase
    .from('press_kit_links')
    .select('url')
    .eq('press_kit_id', pressKitId);
  const existingUrls = new Set((existingLinks || []).map((l: any) => l.url));
  for (const link of scraped.links) {
    if (existingUrls.has(link.url)) continue;
    const { error } = await supabase.from('press_kit_links').insert({
      press_kit_id: pressKitId,
      label: link.label,
      url: link.url,
    });
    if (!error) stats.links += 1;
  }

  revalidatePath(`/dashboard/edit/${pressKitId}`);
  return { success: true, stats, source: scraped.source };
}

async function downloadAndStore(
  supabase: ReturnType<typeof createAdminClient>,
  pressKitId: string,
  type: 'header' | 'screenshot' | 'logo',
  url: string
): Promise<boolean> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PresskitGen/1.0)' },
    });
    if (!resp.ok) return false;
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(await resp.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) return false;

    const filename = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${pressKitId}/${type}/${filename}`;

    const { error: upErr } = await supabase.storage
      .from('press-kit-assets')
      .upload(path, buffer, { contentType, upsert: false });
    if (upErr) return false;

    const { data: urlData } = supabase.storage.from('press-kit-assets').getPublicUrl(path);

    const { error: insertErr } = await supabase.from('press_kit_assets').insert({
      press_kit_id: pressKitId,
      type,
      url: urlData.publicUrl,
      filename,
      mime_type: contentType,
      file_size: buffer.length,
    });
    return !insertErr;
  } catch {
    return false;
  }
}
