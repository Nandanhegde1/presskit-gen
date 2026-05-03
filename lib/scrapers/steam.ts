// Steam store page scraper. No third-party deps — uses fetch + regex.
// Steam store pages are public; scraping for personal/owner reuse is permitted.

export type ScrapedKit = {
  source: 'steam' | 'itch';
  sourceUrl: string;
  gameName: string;
  tagline: string | null;
  description: string | null;
  releaseDate: string | null; // YYYY-MM-DD
  platforms: string[];
  websiteUrl: string | null;
  headerImageUrl: string | null;
  screenshotUrls: string[];
  trailerUrls: string[];
  links: { label: string; url: string }[];
};

const STEAM_AGE_COOKIES = [
  'birthtime=0',
  'mature_content=1',
  'lastagecheckage=1-January-1970',
  'wants_mature_content=1',
].join('; ');

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
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function extractAppId(url: string): string | null {
  const m = url.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}

export async function scrapeSteam(url: string): Promise<ScrapedKit> {
  const appId = extractAppId(url);
  if (!appId) throw new Error('Not a valid Steam store URL (must contain /app/<id>)');

  // Use Steam's public API for structured data — far more reliable than HTML scraping.
  const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`;
  const apiResp = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PresskitGen/1.0)',
      Cookie: STEAM_AGE_COOKIES,
    },
    cache: 'no-store',
  });

  if (!apiResp.ok) {
    throw new Error(`Steam API returned ${apiResp.status}`);
  }

  const json = (await apiResp.json()) as Record<string, { success: boolean; data?: any }>;
  const entry = json[appId];
  if (!entry?.success || !entry.data) {
    throw new Error('Steam returned no data for this app (it may be unreleased or region-locked).');
  }

  const data = entry.data;

  const platforms: string[] = [];
  if (data.platforms?.windows) platforms.push('PC');
  if (data.platforms?.mac) platforms.push('Mac');
  if (data.platforms?.linux) platforms.push('Linux');
  // Steam-only platforms by default (Steam doesn't tell us about console releases via this API)
  platforms.push('Steam');

  let releaseDate: string | null = null;
  const rawDate = data.release_date?.date as string | undefined;
  if (rawDate && !data.release_date?.coming_soon) {
    const parsed = Date.parse(rawDate);
    if (!isNaN(parsed)) {
      releaseDate = new Date(parsed).toISOString().slice(0, 10);
    }
  }

  const screenshotUrls: string[] =
    (data.screenshots as { path_full: string }[] | undefined)?.map((s) => s.path_full) ?? [];

  const trailerUrls: string[] = [];
  for (const movie of (data.movies as any[] | undefined) ?? []) {
    const mp4 = movie?.mp4?.max ?? movie?.mp4?.['480'];
    const webm = movie?.webm?.max ?? movie?.webm?.['480'];
    const candidate = mp4 || webm;
    if (candidate) trailerUrls.push(candidate);
  }

  const links: { label: string; url: string }[] = [
    { label: 'Steam', url: `https://store.steampowered.com/app/${appId}/` },
  ];
  if (data.website) links.push({ label: 'Official Website', url: data.website });

  return {
    source: 'steam',
    sourceUrl: url,
    gameName: data.name || 'Untitled Game',
    tagline: data.short_description ? stripHtml(data.short_description).slice(0, 200) : null,
    description: data.detailed_description ? stripHtml(data.detailed_description) : null,
    releaseDate,
    platforms,
    websiteUrl: data.website || null,
    headerImageUrl: data.header_image || null,
    screenshotUrls,
    trailerUrls,
    links,
  };
}
