import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { PressKitView } from '@/components/themes/PressKitThemes';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: kit } = await supabase
    .from('press_kits')
    .select('game_name, tagline, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!kit) return { title: 'Press Kit Not Found' };

  return {
    title: `${kit.game_name} - Press Kit`,
    description: kit.tagline || kit.description || `Press kit for ${kit.game_name}`,
  };
}

export default async function PublicPressKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: kit, error } = await supabase
    .from('press_kits')
    .select(`
      *,
      press_kit_assets!press_kit_assets_press_kit_id_fkey(*),
      press_kit_links!press_kit_links_press_kit_id_fkey(*),
      press_kit_contacts!press_kit_contacts_press_kit_id_fkey(*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !kit) notFound();

  try {
    await supabase
      .from('press_kits')
      .update({ view_count: (kit.view_count || 0) + 1 })
      .eq('id', kit.id);

    const h = await headers();
    await supabase.from('analytics_events').insert({
      press_kit_id: kit.id,
      event_type: 'view',
      referrer: h.get('referer') || null,
      user_agent: h.get('user-agent') || null,
    });
  } catch {
    // best-effort analytics; never block render
  }

  const themeId = kit.template_id || 'modern';
  return <PressKitView kit={kit} themeId={themeId} />;
}
