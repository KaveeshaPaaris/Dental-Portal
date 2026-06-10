import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Browser Client — uses the ANON key only.
 * Lazy-initialized to avoid build-time failures when env vars aren't set.
 * Used ONLY for authentication (sign in / sign out / session).
 * ALL data operations go through the Express API.
 */
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
    _supabase = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'dental-admin-auth' },
    });
  }
  return _supabase;
}

// Convenience export (same instance, lazy)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});
