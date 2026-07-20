const fs = require('fs');
let content = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf-8');

const targetStr1 = `      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création de l\\'utilisateur');

      const userId = authData.user.id;

      // 2. Update profile with role (the trigger should have created it)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: role,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 3. If seller, create store
      if (role === 'seller') {
        const { error: storeError } = await supabase
          .from('stores')
          .insert([
            {
              id: userId,
              name: data.storeName,
              description: data.storeDescription,
            },
          ]);

        if (storeError) throw storeError;
      }`;

const replacementStr1 = `      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: role,
            store_name: role === 'seller' ? data.storeName : undefined,
            store_description: role === 'seller' ? data.storeDescription : undefined,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création de l\\'utilisateur');

      // The profile and store will be synced in AuthProvider.tsx upon first login,
      // because immediately after signUp the user session is null if email confirmation is enabled,
      // which causes RLS errors for profile update and store insert.`;

content = content.replace(targetStr1, replacementStr1);

fs.writeFileSync('src/pages/auth/RegisterPage.tsx', content, 'utf-8');
