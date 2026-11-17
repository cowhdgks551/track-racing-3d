import { createClient } from '@supabase/supabase-js';

// Public browser key only. Database access is protected by per-user RLS policies.
export const supabase = createClient(
  'https://zkmmsyohqcfrifuccsdr.supabase.co',
  'sb_publishable_nr63I5Z7EpCfd9Jo5tHC1w_esHmyeKk',
  { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } }
);
