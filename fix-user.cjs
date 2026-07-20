const fs = require('fs');
let content = fs.readFileSync('src/pages/seller/SellerOrdersPage.tsx', 'utf-8');

content = content.replace(/const \{ user \} = useAuth\(\);\s*const \{ user \} = useAuth\(\);/, 'const { user } = useAuth();');

fs.writeFileSync('src/pages/seller/SellerOrdersPage.tsx', content);
