const fs = require('fs');
let code = fs.readFileSync('src/hooks/usePromotions.ts', 'utf8');
code = code.replace(/const \{ data \} = await supabase\.from\('promotions'\)\.select\('\*'\)\.eq\('isActive', true\);/g, `let data = null;
      try {
        const res = await supabase.from('promotions').select('*').eq('isActive', true);
        data = res.data;
      } catch (e) {
        console.error(e);
      }`);
fs.writeFileSync('src/hooks/usePromotions.ts', code);
