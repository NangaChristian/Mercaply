const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSellers.ts', 'utf8');
code = code.replace(/\.eq\('status', 'active'\)/g, "");
fs.writeFileSync('src/hooks/useSellers.ts', code);
