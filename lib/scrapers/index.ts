import { scrapeSteam, type ScrapedKit } from './steam';
import { scrapeItch } from './itch';

export type { ScrapedKit } from './steam';

export async function scrapeUrl(url: string): Promise<ScrapedKit> {
  const u = url.trim();
  if (/store\.steampowered\.com/i.test(u)) return scrapeSteam(u);
  if (/itch\.io/i.test(u)) return scrapeItch(u);
  throw new Error(
    'Unsupported URL. Paste a Steam store URL (store.steampowered.com/app/...) or an itch.io game page URL.'
  );
}
