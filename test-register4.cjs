const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const email = 'tseller' + Date.now() + '@gmail.com';
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email, password: 'password123', options: { data: { role: 'seller' } }
  });
  console.log('authData', authData, 'authError', authError);

  if (authData?.user) {
     const { data: storeData, error: storeError } = await supabase.from('stores').insert([{
        id: authData.user.id,
        name: 'Test Store'
     }]);
     console.log('Insert store error:', storeError);
  }
}
test();
