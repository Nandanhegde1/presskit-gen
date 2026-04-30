import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import EditClient from './EditClient';

export default async function EditPressKitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: kit } = await supabase
    .from('press_kits')
    .select('*, press_kit_assets(*), press_kit_links(*), press_kit_contacts(*)')
    .eq('id', id)
    .single();

  if (!kit) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href={`/kit/${kit.slug}`}
            target="_blank"
            className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
          >
            View Public Kit <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </nav>
      <EditClient kit={kit} />
    </div>
  );
}
