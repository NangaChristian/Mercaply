const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
code = code.replace(/bg-error/g, "bg-danger");
fs.writeFileSync('src/components/layout/Header.tsx', code);
