const fs = require('fs');
let code = fs.readFileSync('src/hooks/useMessages.ts', 'utf8');

code = code.replace(/if \(!user \|\| !supabase\) \{/, `if (!user) {`);

fs.writeFileSync('src/hooks/useMessages.ts', code);
