import { createClient } from '@/lib/supabase/server';
import { createAdminClient, TEST_USER_ID } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Eye, Download, Settings, LogOut } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's press kits (use admin client to bypass RLS)
  const { data: pressKits } = await adminSupabase
    .from('press_kits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              PresskitGen
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/settings"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Press Kits</h1>
          <p className="text-gray-600">Create and manage your game press kits</p>
        </div>

        {/* Create New Button */}
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold mb-6"
        >
          <Plus className="w-5 h-5" />
          Create New Press Kit
        </Link>

        {/* Press Kits Grid */}
        {pressKits && pressKits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressKits.map((kit) => (
              <div
                key={kit.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {kit.game_name}
                    </h3>
                    {kit.tagline && (
                      <p className="text-sm text-gray-600">{kit.tagline}</p>
                    )}
                  </div>
                  {kit.is_premium && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {kit.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {kit.download_count}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/kit/${kit.slug}`}
                    target="_blank"
                    className="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/edit/${kit.id}`}
                    className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  URL: presskitgen.com/kit/{kit.slug}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No press kits yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first press kit in just 5 minutes
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Press Kit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
