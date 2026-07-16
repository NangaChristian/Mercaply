const fs = require('fs');

// Fix useProducts
let code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');
code = code.replace(/let query = supabase\.from\('products'\)\.select\('\*'\)\.eq\('isActive', true\)\.order\('createdAt', \{ ascending: false \}\);/g, "let query = supabase.from('products').select('*').order('created_at', { ascending: false });");
code = code.replace(/if \(options\.sellerId\) query = query\.eq\('sellerId', options\.sellerId\);/g, "if (options.sellerId) query = query.eq('store_id', options.sellerId);");
code = code.replace(/if \(options\.region\) query = query\.eq\('region', options\.region\);/g, "");
fs.writeFileSync('src/hooks/useProducts.ts', code);

// Fix useServices
code = fs.readFileSync('src/hooks/useServices.ts', 'utf8');
code = code.replace(/let q = supabase\.from\('services'\)\.select\('\*'\)\.eq\('isActive', true\);/g, "let q = supabase.from('services').select('*');");
code = code.replace(/if \(options\.sellerId\) q = q\.eq\('sellerId', options\.sellerId\);/g, "if (options.sellerId) q = q.eq('store_id', options.sellerId);");
code = code.replace(/if \(options\.region\) q = q\.eq\('region', options\.region\);/g, "");
fs.writeFileSync('src/hooks/useServices.ts', code);

// Fix useOrders
code = fs.readFileSync('src/hooks/useOrders.ts', 'utf8');
code = code.replace(/const field = role === 'seller' \? 'sellerId' : 'userId';/g, "const field = role === 'seller' ? 'seller_id' : 'buyer_id';");
code = code.replace(/\.order\('createdAt',/g, ".order('created_at',");
fs.writeFileSync('src/hooks/useOrders.ts', code);

