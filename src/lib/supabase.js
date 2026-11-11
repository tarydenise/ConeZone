import { createClient } from '@supabase/supabase-js';

// One shared Supabase client for the whole app.
// It runs in the browser and keeps the login session in local storage.
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
);