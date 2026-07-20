const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('admin_settings').select('*').limit(1);
  if (error) console.error("Error fetching admin_settings:", error);
  else console.log("admin_settings columns:", data && data.length > 0 ? Object.keys(data[0]) : "table exists, but empty");
}

main();
