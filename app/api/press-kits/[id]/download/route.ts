import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import JSZip from 'jszip';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch press kit and assets
  const { data: kit, error: kitErr } = await supabase
    .from('press_kits')
    .select('*, press_kit_assets(*), press_kit_links(*), press_kit_contacts(*)')
    .eq('id', id)
    .single();

  if (kitErr || !kit) {
    return NextResponse.json({ error: 'Press kit not found' }, { status: 404 });
  }

  const zip = new JSZip();

  // Add factsheet (txt)
  const factsheet = [
    `# ${kit.game_name}`,
    kit.tagline ? `\n${kit.tagline}` : '',
    '',
    kit.release_date ? `Release Date: ${kit.release_date}` : '',
    kit.platforms?.length ? `Platforms: ${kit.platforms.join(', ')}` : '',
    kit.website_url ? `Website: ${kit.website_url}` : '',
    '',
    '## About',
    kit.description || '',
    '',
    '## Links',
    ...(kit.press_kit_links || []).map((l: any) => `- ${l.title}: ${l.url}`),
    '',
    '## Contact',
    ...(kit.press_kit_contacts || []).map((c: any) => `${c.name || ''} ${c.role ? `(${c.role})` : ''} - ${c.email}`),
  ].filter(Boolean).join('\n');

  zip.file('factsheet.txt', factsheet);

  // Fetch and add each asset
  const assets = kit.press_kit_assets || [];
  for (const asset of assets) {
    try {
      const res = await fetch(asset.url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const folder = asset.type === 'screenshot' ? 'screenshots' : asset.type === 'logo' ? 'logos' : asset.type === 'header' ? 'header' : 'other';
      const filename = asset.filename || `${asset.type}-${asset.id}`;
      zip.folder(folder)?.file(filename, buf);
    } catch (e) {
      // skip failed asset
    }
  }

  // Track download
  await supabase
    .from('press_kits')
    .update({ download_count: (kit.download_count || 0) + 1 })
    .eq('id', id);

  const blob = await zip.generateAsync({ type: 'nodebuffer' });
  const slug = kit.slug || 'press-kit';

  return new NextResponse(new Uint8Array(blob), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}-press-kit.zip"`,
    },
  });
}
