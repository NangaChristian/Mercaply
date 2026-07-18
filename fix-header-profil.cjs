const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

content = content.replace(
  '<User className="h-4 w-4 mr-3 text-text-tertiary" /> Mon profil',
  '<User className="h-4 w-4 mr-3 text-text-tertiary" /> Mon compte'
);

fs.writeFileSync('src/components/layout/Header.tsx', content, 'utf-8');
