import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your Supabase project URL + anon key ' +
      '(Project Settings → API in the Supabase dashboard).'
  );
}

// The anon key is safe to ship to the browser — every table it can touch is
// protected by the RLS policies in supabase/migrations/20260926230800_row_level_security.sql.
// Never put the service_role key here.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    // Needed so a clicked magic-link (#access_token=...) logs the user in
    // automatically when they land back on the app.
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
