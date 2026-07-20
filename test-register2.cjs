const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const email = 'testseller' + Date.now() + '@gmail.com';
  console.log('Registering', email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'Seller',
        role: 'seller'
      }
    }
  });

  if (authError) {
    console.error('Auth error', authError);
    return;
  }
  console.log('User created:', authData.user.id);

  // check profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
  console.log('Initial profile:', profile);

  // try update profile
  const { data: updateData, error: updateError } = await supabase.from('profiles').update({ role: 'seller' }).eq('id', authData.user.id).select();
  console.log('Update profile:', updateData, updateError);

  // try insert store
  const { data: storeData, error: storeError } = await supabase.from('stores').insert([{
    id: authData.user.id,
    name: 'Test Store',
    category: 'Agriculture',
    cni_number: '123',
    description: 'test'
  }]);
  console.log('Insert store:', storeData, storeError);
}
test();
