import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { Download, ExternalLink, Mail, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  
  const { data: kit } = await supabase
    .from('press_kits')
    .select('game_name, tagline, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!kit) {
    return {
      title: 'Press Kit Not Found',
    };
  }

  return {
    title: `${kit.game_name} - Press Kit`,
    description: kit.tagline || kit.description || `Press kit for ${kit.game_name}`,
  };
}

export default async function PublicPressKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Fetch press kit with all related data
  const { data: kit, error } = await supabase
    .from('press_kits')
    .select(`
      *,
      press_kit_assets!press_kit_assets_press_kit_id_fkey(*),
      press_kit_links!press_kit_links_press_kit_id_fkey(*),
      press_kit_contacts!press_kit_contacts_press_kit_id_fkey(*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !kit) {
    notFound();
  }

  // Increment view count
  await supabase
    .from('press_kits')
    .update({ view_count: kit.view_count + 1 })
    .eq('id', kit.id);

  const headerAsset = kit.press_kit_assets?.find((a: any) => a.type === 'header');
  const logos = kit.press_kit_assets?.filter((a: any) => a.type === 'logo') || [];
  const screenshots = kit.press_kit_assets?.filter((a: any) => a.type === 'screenshot') || [];
  const trailers = kit.press_kit_assets?.filter((a: any) => a.type === 'trailer') || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      {headerAsset && (
        <div className="w-full h-96 bg-gray-900 relative overflow-hidden">
          <img
            src={headerAsset.url}
            alt={kit.game_name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title & Tagline */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{kit.game_name}</h1>
          {kit.tagline && (
            <p className="text-2xl text-gray-600 mb-6">{kit.tagline}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {kit.release_date && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(kit.release_date), 'MMMM d, yyyy')}
              </span>
            )}
            {kit.platforms && kit.platforms.length > 0 && (
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {kit.platforms.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {kit.description && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {kit.description}
            </p>
          </div>
        )}

        {/* Screenshots */}
        {screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Screenshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((screenshot: any) => (
                <a
                  key={screenshot.id}
                  href={screenshot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition"
                >
                  <img
                    src={screenshot.url}
                    alt={screenshot.filename}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Trailers */}
        {trailers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trailers & Videos</h2>
            <div className="space-y-4">
              {trailers.map((trailer: any) => (
                <a
                  key={trailer.id}
                  href={trailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition flex items-center justify-between"
                >
                  <span className="font-medium">{trailer.filename}</span>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Logos */}
        {logos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Logos & Icons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logos.map((logo: any) => (
                <a
                  key={logo.id}
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition flex items-center justify-center"
                >
                  <img
                    src={logo.url}
                    alt={logo.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {kit.press_kit_links && kit.press_kit_links.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kit.press_kit_links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition"
                >
                  <span className="font-medium">{link.label}</span>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {kit.press_kit_contacts && kit.press_kit_contacts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact</h2>
            <div className="space-y-4">
              {kit.press_kit_contacts.map((contact: any) => (
                <div key={contact.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-lg">{contact.name}</div>
                  {contact.role && (
                    <div className="text-gray-600">{contact.role}</div>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mt-2"
                    >
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <div className="text-gray-600 mt-1">{contact.phone}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download All Assets */}
        <div className="pt-8 border-t">
          <a
            href={`/api/press-kits/${kit.id}/download`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            <Download className="w-5 h-5" />
            Download All Assets
          </a>
        </div>

        {/* Footer */}
        {!kit.is_premium && (
          <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
            Press kit created with{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              PresskitGen
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
