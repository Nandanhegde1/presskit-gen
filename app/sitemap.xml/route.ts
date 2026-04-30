import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Fetch all published press kits
  const { data: pressKits } = await supabase
    .from('press_kits')
    .select('slug, updated_at')
    .eq('is_published', true);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://presskitgen.com';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/showcase</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${
    pressKits
      ?.map(
        (kit) => `
  <url>
    <loc>${baseUrl}/kit/${kit.slug}</loc>
    <lastmod>${new Date(kit.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      )
      .join('') || ''
  }
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
