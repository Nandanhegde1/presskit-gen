import Link from 'next/link';

export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign-in failed</h1>
        <p className="text-gray-700 mb-4">
          We couldn&apos;t complete the sign-in. This usually means the OAuth
          provider isn&apos;t configured yet, or the link expired.
        </p>
        {searchParams?.reason && (
          <p className="text-sm text-gray-500 mb-4">Reason: {searchParams.reason}</p>
        )}
        <Link
          href="/auth/login"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
