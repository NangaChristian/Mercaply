import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http');
  } catch (e) {
    return false;
  }
};

export const supabase = (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
