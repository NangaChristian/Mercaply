const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminContentPage.tsx', 'utf-8');
console.log("Length:", content.length);
