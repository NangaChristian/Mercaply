const fs = require('fs');
let pForm = fs.readFileSync('src/pages/seller/SellerProductFormPage.tsx', 'utf-8');
pForm = `import { Button } from '../../components/ui/Button';\n` + pForm;
fs.writeFileSync('src/pages/seller/SellerProductFormPage.tsx', pForm, 'utf-8');

let sForm = fs.readFileSync('src/pages/seller/SellerServiceFormPage.tsx', 'utf-8');
sForm = `import { Button } from '../../components/ui/Button';\n` + sForm;
fs.writeFileSync('src/pages/seller/SellerServiceFormPage.tsx', sForm, 'utf-8');
