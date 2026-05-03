// Bandcamp artist/album page scraper. Uses public HTML + JSON-LD.
// Bandcamp pages are public; scraping for the artist's own kit is fine.

import type { ScrapedKit } from './steam';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div)>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  return m ? decodeHtmlEntities(m[1]) : null;
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // ignore
    }
  }
  return blocks;
}

export async function scrapeBandcamp(url: string): Promise<ScrapedKit> {
  const u = url.trim();
  if (!/\.bandcamp\.com/i.test(u)) {
    throw new Error('Not a valid Bandcamp URL (must be {artist}.bandcamp.com)');
  }

  // Normalize to artist root if path is empty/album/track — keep what user pasted.
  const resp = await fetch(u, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    cache: 'no-store',
  });

  if (!resp.ok) throw new Error(`Bandcamp returned ${resp.status}`);

  const html = await resp.text();

  const ld = extractJsonLd(html);
  const band = ld.find(
    (b) => typeof b['@type'] === 'string' && /MusicGroup|Person/i.test(b['@type'] as string)
  );
  const album = ld.find(
    (b) => typeof b['@type'] === 'string' && /MusicAlbum|MusicRecording/i.test(b['@type'] as string)
  );

  const ogTitle = metaContent(html, 'og:title');
  const ogSiteName = metaContent(html, 'og:site_name');
  // Bandcamp og:title is often "Album Name, by Artist Name" — extract artist, fall back to og:site_name (which IS the artist)
  let nameFromOg: string | null = null;
  if (ogTitle) {
    const byMatch = ogTitle.match(/^(?:.+?),\s+by\s+(.+)$/i);
    nameFromOg = byMatch ? byMatch[1].trim() : ogTitle.trim();
  }

  const name =
    (band?.name as string | undefined) ||
    (album?.byArtist as { name?: string } | undefined)?.name ||
    ogSiteName ||
    nameFromOg ||
    'Untitled Artist';

  const ogDesc = metaContent(html, 'og:description');
  const tagline = ogDesc ? ogDesc.replace(/\s+/g, ' ').trim().slice(0, 200) : null;

  // Bandcamp band-bio block: <p id="bio-text">…</p>
  let description: string | null = null;
  const bioMatch = html.match(/<p[^>]+id=["']bio-text["'][^>]*>([\s\S]*?)<\/p>/i);
  if (bioMatch) {
    description = stripHtml(bioMatch[1]);
  } else if (band?.description) {
    description = stripHtml(String(band.description));
  }

  const headerImageUrl =
    (band?.image as string | undefined) ||
    (album?.image as string | undefined) ||
    metaContent(html, 'og:image') ||
    null;

  // Location: <span class="location">City, Country</span>
  let location: string | null = null;
  const locMatch = html.match(/<span[^>]+class=["']location["'][^>]*>([^<]+)<\/span>/i);
  if (locMatch) location = decodeHtmlEntities(locMatch[1]).trim();

  // Links: Bandcamp itself + sameAs from JSON-LD + any links in the artist sidebar
  let bcRoot = u;
  try {
    const parsed = new URL(u);
    bcRoot = `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    // ignore
  }
  const links: { label: string; url: string }[] = [{ label: 'Bandcamp', url: bcRoot }];
  const sameAs = (band?.sameAs as string[] | undefined) || [];
  for (const link of sameAs) {
    const labelGuess = (() => {
      try {
        const host = new URL(link).hostname.replace(/^www\./, '').split('.')[0];
        return host.charAt(0).toUpperCase() + host.slice(1);
      } catch {
        return 'Link';
      }
    })();
    if (!links.some((l) => l.url === link)) links.push({ label: labelGuess, url: link });
  }

  // Pull additional sites from band-links sidebar block
  const sidebarMatches = html.matchAll(
    /<li[^>]+class=["'][^"']*band-link[^"']*["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["']/gi
  );
  for (const m of sidebarMatches) {
    const link = m[1];
    if (!links.some((l) => l.url === link)) {
      try {
        const host = new URL(link).hostname.replace(/^www\./, '').split('.')[0];
        links.push({
          label: host.charAt(0).toUpperCase() + host.slice(1),
          url: link,
        });
      } catch {
        // ignore
      }
    }
  }

  return {
    source: 'bandcamp',
    sourceUrl: u,
    gameName: name,
    tagline,
    description,
    releaseDate: null,
    platforms: location ? ['Bandcamp', location] : ['Bandcamp'],
    websiteUrl: null,
    headerImageUrl,
    screenshotUrls: headerImageUrl ? [headerImageUrl] : [],
    trailerUrls: [],
    links,
  };
}
