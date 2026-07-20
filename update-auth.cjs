const fs = require('fs');
let content = fs.readFileSync('src/components/auth/AuthProvider.tsx', 'utf-8');

const targetStr = `          if (profile) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: profile.role || metaRole || 'buyer',
              createdAt: profile.created_at || new Date().toISOString(),
              isVerified: profile.is_verified || false,
            } as AppUser);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: metaRole || 'buyer',
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
          }`;

const replacementStr = `          let finalRole = profile?.role || metaRole || 'buyer';
          
          if (metaRole === 'seller' && profile?.role !== 'seller') {
            // Fix conflict: update profile role to seller since trigger defaulted to buyer
            const { error: pErr } = await supabase.from('profiles').update({ role: 'seller' }).eq('id', session.user.id);
            if (!pErr) finalRole = 'seller';
            
            const storeName = session.user?.user_metadata?.store_name;
            if (storeName) {
              const { data: store } = await supabase.from('stores').select('id').eq('id', session.user.id).single();
              if (!store) {
                await supabase.from('stores').insert([{
                  id: session.user.id,
                  name: storeName,
                  description: session.user?.user_metadata?.store_description
                }]);
              }
            }
          }

          if (profile) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: profile.created_at || new Date().toISOString(),
              isVerified: profile.is_verified || false,
            } as AppUser);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
          }`;

content = content.replaceAll(targetStr, replacementStr);
fs.writeFileSync('src/components/auth/AuthProvider.tsx', content, 'utf-8');
