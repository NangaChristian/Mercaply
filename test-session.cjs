const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const email = 'tsess' + Date.now() + '@gmail.com';
  const { data: authData } = await supabase.auth.signUp({
    email, password: 'password123', options: { data: { role: 'seller' } }
  });
  console.log('Session is null?', authData.session === null);
}
test();
