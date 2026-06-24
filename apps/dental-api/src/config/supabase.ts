import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { env } from './env';

/**
 * Supabase Admin Client — uses the service role key.
 * This client BYPASSES Row Level Security and must ONLY be used server-side.
 * Never expose this key or this client to the browser.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws as any,
  },
});
