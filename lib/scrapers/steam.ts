// Steam store page scraper. No third-party deps — uses fetch + regex.
// Steam store pages are public; scraping for personal/owner reuse is permitted.

export type ScrapedKit = {
  source: 'steam' | 'itch' | 'spotify' | 'bandcamp';
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
      // Strip any <video>, <script>, <style> blocks entirely (Steam embeds inline videos)
      .replace(/<(video|script|style|source)[\s\S]*?<\/\1>/gi, '')
      .replace(/<(img|video|source)[^>]*\/?>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      // Headings/list-items deserve their own line — insert linebreaks BEFORE stripping tags
      .replace(/<h[1-6][^>]*>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+\n/g, '\n')
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

  // Description preference order:
  //   1. `about_the_game` (cleanest — just the game pitch)
  //   2. `detailed_description` with bundle/edition preamble stripped
  //   3. `short_description`
  let description: string | null = null;
  if (data.about_the_game) {
    description = stripHtml(data.about_the_game);
  } else if (data.detailed_description) {
    description = cleanDetailedDescription(data.detailed_description);
  } else if (data.short_description) {
    description = stripHtml(data.short_description);
  }

  return {
    source: 'steam',
    sourceUrl: url,
    gameName: data.name || 'Untitled Game',
    tagline: data.short_description ? stripHtml(data.short_description).slice(0, 200) : null,
    description,
    releaseDate,
    platforms,
    websiteUrl: data.website || null,
    headerImageUrl: data.header_image || null,
    screenshotUrls,
    trailerUrls,
    links,
  };
}

/**
 * Steam's `detailed_description` often starts with bundle/edition boilerplate
 * (e.g. "ELDEN RING Shadow of the Erdtree Edition includes: ..."). The actual
 * game description usually starts after an "About the Game" / "About this Game"
 * marker. Slice from there, falling back to the original HTML if no marker.
 */
function cleanDetailedDescription(html: string): string {
  const aboutMatch = html.match(/About\s+(?:the|this)\s+Game[^<]*<\/[^>]+>/i);
  let body = html;
  if (aboutMatch && aboutMatch.index !== undefined) {
    body = html.slice(aboutMatch.index + aboutMatch[0].length);
  }
  // Drop any leading "Edition includes:" / "Buy X Edition" promo blocks
  body = body.replace(/^[\s\S]*?(?=<p|<h[1-6]|<div|<br|[A-Z])/, '');
  return stripHtml(body);
}
