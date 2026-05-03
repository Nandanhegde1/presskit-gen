// Spotify artist scraper. Uses public oEmbed API (no auth required).
// Spotify's HTML is a JS SPA shell with no SSR data, so scraping the page is useless.
// oEmbed gives us: title, thumbnail_url, author_name. Enough to seed a press kit.

import type { ScrapedKit } from './steam';

type OEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  html?: string;
};

export async function scrapeSpotify(url: string): Promise<ScrapedKit> {
  const u = url.trim();
  if (!/open\.spotify\.com\/artist\//i.test(u)) {
    throw new Error('Not a valid Spotify artist URL (must be open.spotify.com/artist/...)');
  }

  const cleanUrl = u.split('?')[0].split('#')[0];
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`;

  const resp = await fetch(oembedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PresskitGen/1.0)',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!resp.ok) {
    throw new Error(`Spotify oEmbed returned ${resp.status}`);
  }

  const data = (await resp.json()) as OEmbedResponse;

  const name = (data.title || data.author_name || '').trim() || 'Untitled Artist';
  const headerImageUrl = data.thumbnail_url || null;

  return {
    source: 'spotify',
    sourceUrl: cleanUrl,
    gameName: name,
    tagline: data.provider_name ? `On ${data.provider_name}` : null,
    description: null,
    releaseDate: null,
    platforms: ['Spotify'],
    websiteUrl: null,
    headerImageUrl,
    screenshotUrls: headerImageUrl ? [headerImageUrl] : [],
    trailerUrls: [],
    links: [{ label: 'Spotify', url: cleanUrl }],
  };
}
