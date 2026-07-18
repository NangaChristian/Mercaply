const fs = require('fs');
let content = fs.readFileSync('src/components/layout/BuyerLayout.tsx', 'utf-8');

content = content.replace(
  "{ name: 'Mon profil', path: '/buyer/profile', icon: User }",
  "{ name: 'Mon compte', path: '/buyer/profile', icon: User }"
);

fs.writeFileSync('src/components/layout/BuyerLayout.tsx', content, 'utf-8');
