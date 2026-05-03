'use client';

// Visual themes for the public press-kit page. Each theme is a self-contained
// component that takes the same `kit` prop. Add new themes here and to the
// THEMES list in EditClient.tsx.

import { Download, ExternalLink, Mail, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';

type Asset = { id: string; type: string; url: string; filename: string };
type LinkRow = { id: string; label: string; url: string };
type Contact = { id: string; name: string; role?: string | null; email?: string | null; phone?: string | null };

export type KitForTheme = {
  id: string;
  game_name: string;
  tagline: string | null;
  description: string | null;
  release_date: string | null;
  platforms: string[] | null;
  is_premium: boolean;
  press_kit_assets: Asset[];
  press_kit_links: LinkRow[];
  press_kit_contacts: Contact[];
};

function partitionAssets(kit: KitForTheme) {
  const a = kit.press_kit_assets || [];
  return {
    header: a.find((x) => x.type === 'header'),
    logos: a.filter((x) => x.type === 'logo'),
    screenshots: a.filter((x) => x.type === 'screenshot'),
    trailers: a.filter((x) => x.type === 'trailer'),
  };
}

function FormattedDate({ date }: { date: string | null }) {
  if (!date) return null;
  try {
    return <>{format(new Date(date), 'MMMM d, yyyy')}</>;
  } catch {
    return <>{date}</>;
  }
}

/* ---------- MODERN (default) ---------- */
export function ModernTheme({ kit }: { kit: KitForTheme }) {
  const { header, logos, screenshots, trailers } = partitionAssets(kit);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {header && (
        <div className="w-full h-96 bg-gray-900 relative overflow-hidden">
          <img src={header.url} alt={kit.game_name} className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">{kit.game_name}</h1>
          {kit.tagline && <p className="text-2xl text-gray-600 mb-6">{kit.tagline}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {kit.release_date && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> <FormattedDate date={kit.release_date} />
              </span>
            )}
            {kit.platforms && kit.platforms.length > 0 && (
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> {kit.platforms.join(', ')}
              </span>
            )}
          </div>
        </div>

        {kit.description && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{kit.description}</p>
          </div>
        )}

        {screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="block aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition">
                  <img src={s.url} alt={s.filename} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {trailers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Trailers & Videos</h2>
            <div className="space-y-4">
              {trailers.map((t) => (
                <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                   className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition flex items-center justify-between">
                  <span className="font-medium">{t.filename}</span>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {logos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Logos & Icons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logos.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="aspect-square bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition flex items-center justify-center">
                  <img src={l.url} alt={l.filename} className="max-w-full max-h-full object-contain" />
                </a>
              ))}
            </div>
          </div>
        )}

        {kit.press_kit_links?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kit.press_kit_links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition">
                  <span className="font-medium">{l.label}</span>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {kit.press_kit_contacts?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Contact</h2>
            <div className="space-y-4">
              {kit.press_kit_contacts.map((c) => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-lg">{c.name}</div>
                  {c.role && <div className="text-gray-600">{c.role}</div>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4" /> {c.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 border-t">
          <a href={`/api/press-kits/${kit.id}/download`}
             className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold">
            <Download className="w-5 h-5" /> Download All Assets
          </a>
        </div>

        {!kit.is_premium && (
          <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
            Press kit created with{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">PresskitGen</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- CYBERPUNK ---------- */
export function CyberpunkTheme({ kit }: { kit: KitForTheme }) {
  const { header, logos, screenshots, trailers } = partitionAssets(kit);
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-cyan-100" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
      {header && (
        <div className="w-full h-[28rem] relative overflow-hidden border-b-2 border-cyan-500/50">
          <img src={header.url} alt={kit.game_name} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/40 to-[#0a0a0f]" />
          <div className="absolute inset-0 pointer-events-none" style={{
            background:
              'repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, transparent 1px, transparent 4px)',
          }} />
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.4em] text-cyan-400 mb-2">// PRESS KIT</div>
          <h1 className="text-6xl font-extrabold text-cyan-300 mb-3" style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>
            {kit.game_name}
          </h1>
          {kit.tagline && <p className="text-xl text-pink-400 mb-6">&gt; {kit.tagline}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-cyan-200/70">
            {kit.release_date && (
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <FormattedDate date={kit.release_date} /></span>
            )}
            {kit.platforms?.length ? (
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {kit.platforms.join(' / ')}</span>
            ) : null}
          </div>
        </div>

        {kit.description && (
          <div className="mb-12 border-l-2 border-cyan-500 pl-6">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">[ ABOUT ]</h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-cyan-100/90">{kit.description}</p>
          </div>
        )}

        {screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">[ SCREENSHOTS ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="block aspect-video bg-cyan-900/20 border border-cyan-500/40 rounded overflow-hidden hover:border-cyan-300 transition">
                  <img src={s.url} alt={s.filename} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {trailers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">[ TRAILERS ]</h2>
            <div className="space-y-2">
              {trailers.map((t) => (
                <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                   className="p-3 border border-cyan-500/40 rounded hover:border-cyan-300 hover:bg-cyan-500/10 transition flex items-center justify-between">
                  <span>{t.filename}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        {logos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">[ LOGOS ]</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logos.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="aspect-square bg-cyan-900/20 border border-cyan-500/40 rounded p-4 hover:border-cyan-300 transition flex items-center justify-center">
                  <img src={l.url} alt={l.filename} className="max-w-full max-h-full object-contain" />
                </a>
              ))}
            </div>
          </div>
        )}

        {kit.press_kit_links?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">[ LINKS ]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kit.press_kit_links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-3 border border-cyan-500/40 rounded hover:border-cyan-300 hover:bg-cyan-500/10 transition">
                  <span>{l.label}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}

        {kit.press_kit_contacts?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300">[ CONTACT ]</h2>
            <div className="space-y-3">
              {kit.press_kit_contacts.map((c) => (
                <div key={c.id} className="p-4 border border-cyan-500/40 rounded bg-cyan-900/10">
                  <div className="font-semibold text-cyan-200">{c.name}</div>
                  {c.role && <div className="text-cyan-400/80 text-sm">{c.role}</div>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-pink-400 hover:text-pink-300 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {c.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-cyan-500/30">
          <a href={`/api/press-kits/${kit.id}/download`}
             className="inline-flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded font-bold uppercase tracking-wider hover:bg-cyan-300 transition">
            <Download className="w-5 h-5" /> Download All Assets
          </a>
        </div>

        {!kit.is_premium && (
          <div className="mt-12 pt-8 border-t border-cyan-500/30 text-center text-sm text-cyan-500/60">
            // Generated by <a href="/" className="text-cyan-300 hover:text-cyan-200 font-bold">PresskitGen</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- RETRO ---------- */
export function RetroTheme({ kit }: { kit: KitForTheme }) {
  const { header, logos, screenshots, trailers } = partitionAssets(kit);
  return (
    <div className="min-h-screen bg-amber-50 text-stone-900" style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="border-4 border-stone-900 bg-white p-6 mb-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.9)]">
          <div className="text-xs uppercase tracking-widest text-rose-600 mb-1">★ PRESS KIT ★</div>
          <h1 className="text-5xl font-black uppercase mb-3 text-stone-900">{kit.game_name}</h1>
          {kit.tagline && (
            <p className="text-xl text-stone-700 italic border-l-4 border-rose-400 pl-4">{kit.tagline}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-stone-600 mt-4">
            {kit.release_date && (
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> <FormattedDate date={kit.release_date} /></span>
            )}
            {kit.platforms?.length ? (
              <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {kit.platforms.join(' • ')}</span>
            ) : null}
          </div>
        </div>

        {header && (
          <div className="border-4 border-stone-900 mb-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.9)]">
            <img src={header.url} alt={kit.game_name} className="w-full" />
          </div>
        )}

        {kit.description && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">About</h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{kit.description}</p>
          </section>
        )}

        {screenshots.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="block border-4 border-stone-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.9)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.9)] transition">
                  <img src={s.url} alt={s.filename} className="w-full aspect-video object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

        {trailers.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">Trailers</h2>
            <div className="space-y-2">
              {trailers.map((t) => (
                <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                   className="block p-3 border-2 border-stone-900 bg-white hover:bg-amber-100 transition flex items-center justify-between">
                  <span className="font-bold">▶ {t.filename}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </section>
        )}

        {logos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">Logos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {logos.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="aspect-square border-2 border-stone-900 bg-white p-3 hover:bg-amber-100 transition flex items-center justify-center">
                  <img src={l.url} alt={l.filename} className="max-w-full max-h-full object-contain" />
                </a>
              ))}
            </div>
          </section>
        )}

        {kit.press_kit_links?.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {kit.press_kit_links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between p-3 border-2 border-stone-900 bg-white hover:bg-amber-100 transition">
                  <span className="font-bold">→ {l.label}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </section>
        )}

        {kit.press_kit_contacts?.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black uppercase mb-3 underline decoration-rose-500 decoration-4 underline-offset-4">Contact</h2>
            <div className="space-y-2">
              {kit.press_kit_contacts.map((c) => (
                <div key={c.id} className="p-4 border-2 border-stone-900 bg-white">
                  <div className="font-bold">{c.name}</div>
                  {c.role && <div className="text-sm text-stone-600">{c.role}</div>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-rose-600 underline flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {c.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pt-8 border-t-4 border-stone-900 border-dashed">
          <a href={`/api/press-kits/${kit.id}/download`}
             className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 border-4 border-stone-900 font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,0.9)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.9)] transition">
            <Download className="w-5 h-5" /> Download All Assets
          </a>
        </div>

        {!kit.is_premium && (
          <div className="mt-10 pt-6 text-center text-sm text-stone-500">
            ✦ Made with <a href="/" className="text-rose-600 font-bold underline">PresskitGen</a> ✦
          </div>
        )}
      </div>
    </div>
  );
}

export function PressKitView({ kit, themeId }: { kit: KitForTheme; themeId: string }) {
  switch (themeId) {
    case 'cyberpunk':
      return <CyberpunkTheme kit={kit} />;
    case 'retro':
      return <RetroTheme kit={kit} />;
    case 'modern':
    case 'default':
    default:
      return <ModernTheme kit={kit} />;
  }
}
