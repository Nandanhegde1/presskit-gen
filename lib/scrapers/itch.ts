// itch.io game page scraper. No third-party deps — uses fetch + regex.
// itch.io game pages are public; scraping for personal/owner use is permitted.

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
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function pickMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]);
  // Try reversed order
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]) : null;
}

export async function scrapeItch(url: string): Promise<ScrapedKit> {
  if (!/itch\.io/i.test(url)) {
    throw new Error('Not a valid itch.io URL');
  }

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PresskitGen/1.0)' },
    cache: 'no-store',
  });
  if (!resp.ok) throw new Error(`itch.io returned ${resp.status}`);
  const html = await resp.text();

  const gameName =
    pickMeta(html, 'og:title') ||
    (html.match(/<h1[^>]+class=["'][^"']*game_title[^"']*["'][^>]*>([^<]+)<\/h1>/i)?.[1] ?? null) ||
    'Untitled Game';

  const tagline = pickMeta(html, 'og:description') || null;
  const headerImageUrl = pickMeta(html, 'og:image') || null;

  // Description: <div class="formatted_description user_formatted">
  let description: string | null = null;
  const descMatch = html.match(
    /<div[^>]+class=["'][^"']*formatted_description[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<div|<section|<footer)/i
  );
  if (descMatch) {
    description = stripHtml(descMatch[1]);
  }

  // Screenshots: <a data-image_lightbox="true" ... href="https://img.itch.zone/.../original/...png">
  const screenshotUrls: string[] = [];
  const seen = new Set<string>();
  const scRe = /<a[^>]+data-image_lightbox=["']true["'][^>]+href=["']([^"']+)["']/gi;
  let scMatch: RegExpExecArray | null;
  while ((scMatch = scRe.exec(html)) !== null) {
    if (!seen.has(scMatch[1])) {
      seen.add(scMatch[1]);
      screenshotUrls.push(scMatch[1]);
    }
  }
  // Fallback: any img.itch.zone "original" URL
  if (screenshotUrls.length === 0) {
    const fallbackRe = /https:\/\/img\.itch\.zone\/[^"'\s]+\/original\/[^"'\s]+\.(?:png|jpg|jpeg|webp|gif)/gi;
    let fm: RegExpExecArray | null;
    while ((fm = fallbackRe.exec(html)) !== null) {
      if (!seen.has(fm[0])) {
        seen.add(fm[0]);
        screenshotUrls.push(fm[0]);
      }
    }
  }

  // Platforms — itch shows OS icons via .icon classes
  const platforms: string[] = [];
  if (/icon-windows8/i.test(html)) platforms.push('PC');
  if (/icon-apple/i.test(html)) platforms.push('Mac');
  if (/icon-tux/i.test(html)) platforms.push('Linux');
  if (/icon-android/i.test(html)) platforms.push('Android');
  if (/icon-html5/i.test(html)) platforms.push('Web');
  platforms.push('itch.io');

  return {
    source: 'itch',
    sourceUrl: url,
    gameName: stripHtml(gameName).slice(0, 120),
    tagline: tagline ? stripHtml(tagline).slice(0, 200) : null,
    description,
    releaseDate: null,
    platforms,
    websiteUrl: null,
    headerImageUrl,
    screenshotUrls: screenshotUrls.filter((s) => s !== headerImageUrl),
    trailerUrls: [],
    links: [{ label: 'itch.io', url }],
  };
}
