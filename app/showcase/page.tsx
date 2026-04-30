import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Eye, Download, ExternalLink } from 'lucide-react';

export default async function ShowcasePage() {
  const supabase = createAdminClient();

  // Fetch all published press kits
  const { data: pressKits } = await supabase
    .from('press_kits')
    .select(`
      *,
      press_kit_assets!press_kit_assets_press_kit_id_fkey(*)
    `)
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              PresskitGen
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Showcase</h1>
          <p className="text-xl text-gray-600">
            Beautiful press kits created with PresskitGen
          </p>
        </div>

        {/* Grid */}
        {pressKits && pressKits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pressKits.map((kit: any) => {
              const headerAsset = kit.press_kit_assets?.find(
                (asset: any) => asset.type === 'header'
              );

              return (
                <Link
                  key={kit.id}
                  href={`/kit/${kit.slug}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header Image */}
                  {headerAsset ? (
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img
                        src={headerAsset.url}
                        alt={kit.game_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {kit.game_name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                      {kit.game_name}
                    </h3>
                    {kit.tagline && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {kit.tagline}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {kit.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {kit.download_count}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-indigo-600" />
                    </div>

                    {kit.is_premium && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                          Premium Template
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No press kits in the showcase yet</p>
            <Link
              href="/auth/signup"
              className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Be the first to create one →
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Press Kit?</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join the indie developers showcasing their games
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
