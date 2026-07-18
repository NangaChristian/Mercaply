import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('settings').select('*').limit(1);
  console.log("Settings table:", error ? "Error: " + error.message : "Exists!");
  const { data: d2, error: e2 } = await supabase.from('platform_settings').select('*').limit(1);
  console.log("platform_settings table:", e2 ? "Error: " + e2.message : "Exists!");
}
check();
