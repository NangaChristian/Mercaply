const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const email = 'testseller' + Date.now() + '@gmail.com';
  console.log('Registering', email);
  const { data: authData } = await supabase.auth.signUp({
    email, password: 'password123', options: { data: { role: 'seller' } }
  });

  const { data: storeData, error: storeError } = await supabase.from('stores').insert([{
    id: authData.user.id,
    name: 'Test Store',
    description: 'test'
  }]);
  console.log('Insert store:', storeData, storeError);
}
test();
