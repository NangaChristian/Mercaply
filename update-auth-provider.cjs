const fs = require('fs');
let content = fs.readFileSync('src/components/auth/AuthProvider.tsx', 'utf-8');

const targetStr1 = `          if (profile) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: profile.role || 'buyer',
              createdAt: profile.created_at || new Date().toISOString(),
              isVerified: profile.is_verified || false,
            } as AppUser);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: 'buyer',
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
          }`;

const replacementStr1 = `          const metaRole = session.user?.user_metadata?.role;
          if (profile) {
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

content = content.replace(targetStr1, replacementStr1);

// since there are two blocks (one for initial load, one for onAuthStateChange)
content = content.replace(targetStr1, replacementStr1);

fs.writeFileSync('src/components/auth/AuthProvider.tsx', content, 'utf-8');
