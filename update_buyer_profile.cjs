const fs = require('fs');
let code = fs.readFileSync('src/pages/buyer/BuyerProfilePage.tsx', 'utf8');

code = code.replace(/<span className="w-5 h-5 border-2 border-white\/30 border-t-white rounded-full animate-spin mr-2"><\/span>/, `<Loader2 className="w-5 h-5 mr-2 animate-spin" />`);

fs.writeFileSync('src/pages/buyer/BuyerProfilePage.tsx', code);
