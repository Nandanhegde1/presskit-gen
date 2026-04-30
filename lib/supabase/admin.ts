import { createClient } from '@supabase/supabase-js';

// Service role client - bypasses RLS. SERVER ONLY.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// TEMP: Hardcoded test user ID until auth is wired
export const TEST_USER_ID = 'e9fad1d0-6a1d-427d-b909-ae3ca689ae90';
