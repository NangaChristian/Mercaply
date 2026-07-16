const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSeller.ts', 'utf8');
code = code.replace(/\.eq\('ownerId', sellerId\)/g, ".eq('id', sellerId)");
fs.writeFileSync('src/hooks/useSeller.ts', code);
