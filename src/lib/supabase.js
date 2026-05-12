import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Surfaced at startup so misconfigured envs are obvious
  console.error('Supabase env vars missing — check .env.local');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
