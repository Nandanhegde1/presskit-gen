import { scrapeSteam, type ScrapedKit } from './steam';
import { scrapeItch } from './itch';
import { scrapeSpotify } from './spotify';
import { scrapeBandcamp } from './bandcamp';

export type { ScrapedKit } from './steam';

export async function scrapeUrl(url: string): Promise<ScrapedKit> {
  const u = url.trim();
  if (/open\.spotify\.com\/artist\//i.test(u)) return scrapeSpotify(u);
  if (/\.bandcamp\.com/i.test(u)) return scrapeBandcamp(u);
  if (/store\.steampowered\.com/i.test(u)) return scrapeSteam(u);
  if (/itch\.io/i.test(u)) return scrapeItch(u);
  throw new Error(
    'Unsupported URL. Paste a Spotify artist, Bandcamp page, Steam store URL, or itch.io game URL.'
  );
}
